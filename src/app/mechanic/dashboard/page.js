"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menubar } from "primereact/menubar";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Menu } from "primereact/menu";
import { FileUpload } from "primereact/fileupload";
import { Message } from "primereact/message";
import { ProgressBar } from "primereact/progressbar";
import { verifyToken } from "@/lib/jwt";
import { getSignedUrlPutFunction, uploadImageToS3, getSignedUrlGetFunction } from "@/lib/io";
import axios from "axios";

export default function MechanicDashboard() {
    const router = useRouter();
    const toast = useRef(null);
    const [signedUrl, setSignedUrl] = useState('');
    const [fileName, setFileName] = useState('');

    const [provider, setProvider] = useState({
    });

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileUploadRef = useRef(null);

    const [stats, setStats] = useState({
        pendingJobs: 5,
        completedJobs: 40,
        totalEarnings: 12500,
        activeJobs: 3
    });

    const [recentJobs, setRecentJobs] = useState([
        { id: 1, customer: "Alice Smith", service: "Oil Change", status: "completed", date: "2026-02-08", amount: "$75" },
        { id: 2, customer: "Bob Johnson", service: "Brake Repair", status: "in-progress", date: "2026-02-09", amount: "$250" },
        { id: 3, customer: "Carol White", service: "Tire Rotation", status: "pending", date: "2026-02-10", amount: "$50" },
    ]);

    const [chartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Monthly Earnings',
                data: [1200, 1900, 1500, 2100, 1800, 2400],
                fill: false,
                borderColor: '#4F46E5',
                tension: 0.4,
                backgroundColor: 'rgba(79, 70, 229, 0.2)'
            }
        ]
    });

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return '$' + value;
                    }
                }
            }
        }
    };

    useEffect(() => {
        async function fetchProviderData() {
            const authToken = sessionStorage.getItem('authToken');
            if (!authToken) {
                router.push('/mechanic/login');
            } else {
                const email = await verifyToken(authToken);
                console.log('Decoded email from token:', email.username);
                fetch(`/api/v1/providers/me?email=${email.username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Provider data:', data);
                        setProvider(data.data);
                    })
                    .catch(error => {
                        console.error('Error fetching provider data:', error);
                    });
            }
        }
        fetchProviderData();
    }, []);



    const statusBodyTemplate = (rowData) => {
        const severity = rowData.status === 'completed' ? 'success' :
            rowData.status === 'in-progress' ? 'warning' : 'info';
        return <Tag value={rowData.status} severity={severity} />;
    };

    const handleFileUpload = async (event) => {
        setUploading(true);
        const files = event.files;
        setFileName(files[0].name);
        console.log(files[0]);
        try {
            const formData = new FormData();

            files.forEach(file => {
                formData.append('documents', file);
            });

            const objectKey = await getSignedUrlPutFunction('mechanics/documents/' + files[0].name);
            setSignedUrl(objectKey);

            await axios.put(objectKey, files[0], {
                headers: {
                    'Content-Type': files[0].type
                }
            });

            fetch('/api/v1/providers/upload-documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    provider_id: provider.id,
                    documents: files.map(file => ({
                        document_type: file.type,
                        document_url: 'mechanics/documents/' + files[0].name
                    }))
                })
            }).then(response => response.json())
                .then(data => {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: data.message || 'Documents uploaded successfully',
                        life: 5000
                    });
                })
                .catch(error => {
                    console.error('Error uploading document metadata:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to upload document metadata',
                        life: 5000
                    });
                })


            setUploadedFiles([...uploadedFiles, ...files.map(f => f.name)]);
            fileUploadRef.current?.clear();


        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to upload documents',
                life: 5000
            });
        } finally {
            setUploading(false);
        }
    };

    const getProviderStatusSeverity = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'danger';
            default: return 'warning';
        }
    };

    const getURL = async () => {
        try {
            const response = await getSignedUrlGetFunction('mechanics/documents/' + fileName);
            setSignedUrl(response);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to get signed URL',
                life: 5000
            });
        }
    }

    return (
        <>
            <Toast ref={toast} />

            {/* Header Menubar */}


            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Account Status Alert */}
                {provider.status !== 'APPROVED' && (
                    <div className="mb-6">
                        <Message
                            severity={provider.status === 'REJECTED' ? 'error' : 'warn'}
                            className="w-full"
                            content={
                                <div className="flex items-center gap-3">
                                    <i className={`pi ${provider.status === 'REJECTED' ? 'pi-times-circle' : 'pi-exclamation-triangle'} text-2xl`}></i>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">
                                            {provider.status === 'REJECTED' ? 'Account Rejected' : 'Account Pending Approval'}
                                        </h3>
                                        <p className="text-sm">
                                            {provider.status === 'REJECTED'
                                                ? 'Your account has been rejected. Please contact support for more information.'
                                                : 'Please upload your required documents to get your account approved. All features will be enabled after approval.'}
                                        </p>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                )}

                {/* Document Upload Section - Show only if PENDING */}
                {provider.status === 'PENDING' && (
                    <Card title="Upload Required Documents" className="shadow-sm mb-6">
                        <div className="mb-4">
                            <Message
                                severity="info"
                                text="Please upload the following documents: Government ID, Driver's License, Professional Certifications, Insurance Documents"
                                className="mb-4"
                            />
                        </div>
                        <Button label="Show Image" icon="pi pi-upload" onClick={getURL} className="mb-4" />
                        <img src={signedUrl} alt="Signed URL" className="mb-4 w-full" />
                        <label>{signedUrl}</label>
                        <FileUpload
                            ref={fileUploadRef}
                            name="documents"
                            accept="image/*,application/pdf"
                            maxFileSize={5000000}
                            emptyTemplate={
                                <div className="flex flex-col items-center justify-center py-8">
                                    <i className="pi pi-cloud-upload text-6xl text-gray-400 mb-4"></i>
                                    <p className="text-gray-600 mb-2">Drag and drop files here to upload.</p>
                                    <p className="text-sm text-gray-500">PDF or Images (Max 5MB per file)</p>
                                </div>
                            }

                            url={signedUrl}
                            customUpload
                            uploadHandler={handleFileUpload}
                            disabled={uploading}
                        />

                        {uploadedFiles.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Uploaded Files:</h4>
                                <ul className="space-y-2">
                                    {uploadedFiles.map((file, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                            <i className="pi pi-check-circle text-green-600"></i>
                                            {file}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>
                )}

                {/* Show dashboard content only if APPROVED */}
                {provider.status === 'APPROVED' ? (
                    <>
                        {/* Welcome Section */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome back, {provider.name}! 👋
                            </h1>
                            <p className="text-gray-600">Here's what's happening with your services today.</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <Card className="shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar icon="pi pi-clock" size="large" style={{ backgroundColor: '#F59E0B', color: '#ffffff' }} />
                                    <div>
                                        <p className="text-gray-600 text-sm">Pending Jobs</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.pendingJobs}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar icon="pi pi-wrench" size="large" style={{ backgroundColor: '#4F46E5', color: '#ffffff' }} />
                                    <div>
                                        <p className="text-gray-600 text-sm">Active Jobs</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar icon="pi pi-check-circle" size="large" style={{ backgroundColor: '#10B981', color: '#ffffff' }} />
                                    <div>
                                        <p className="text-gray-600 text-sm">Completed</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar icon="pi pi-dollar" size="large" style={{ backgroundColor: '#059669', color: '#ffffff' }} />
                                    <div>
                                        <p className="text-gray-600 text-sm">Total Earnings</p>
                                        <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Chart and Recent Jobs */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Earnings Chart */}
                                <Card title="Earnings Overview" className="shadow-sm">
                                    <Chart type="line" data={chartData} options={chartOptions} style={{ height: '300px' }} />
                                </Card>

                                {/* Recent Jobs */}
                                <Card title="Recent Jobs" className="shadow-sm">
                                    <DataTable value={recentJobs} paginator rows={5} className="p-datatable-sm">
                                        <Column field="customer" header="Customer" />
                                        <Column field="service" header="Service" />
                                        <Column field="date" header="Date" />
                                        <Column field="amount" header="Amount" />
                                        <Column field="status" header="Status" body={statusBodyTemplate} />
                                    </DataTable>
                                </Card>
                            </div>

                            {/* Right Column - Profile & Quick Actions */}
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <Card title="Profile Summary" className="shadow-sm">
                                    <div className="text-center mb-4">
                                        <Avatar
                                            icon="pi pi-user"
                                            size="xlarge"
                                            shape="circle"
                                            style={{ backgroundColor: '#4F46E5', color: '#ffffff', width: '80px', height: '80px' }}
                                            className="mb-3"
                                        />
                                        <h3 className="font-bold text-lg text-gray-900">{provider.name}</h3>
                                        <p className="text-sm text-gray-600">{provider.email}</p>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <i className="pi pi-star-fill text-yellow-500"></i>
                                            <span className="font-semibold">{provider.rating}</span>
                                            <span className="text-gray-500 text-sm">({provider.total_jobs} jobs)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Service Range</span>
                                            <span className="font-semibold text-gray-900">{provider.service_distance} km</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Status</span>
                                            <Tag value={provider.is_active ? "Active" : "Inactive"} severity={provider.is_active ? "success" : "danger"} />
                                        </div>
                                    </div>

                                    <Button label="Edit Profile" icon="pi pi-pencil" className="w-full mt-4" outlined />
                                </Card>

                                {/* Quick Actions */}
                                <Card title="Quick Actions" className="shadow-sm">
                                    <div className="space-y-2">
                                        <Button
                                            label="View New Requests"
                                            icon="pi pi-inbox"
                                            className="w-full"
                                            severity="info"
                                            badge={stats.pendingJobs.toString()}
                                        />
                                        <Button
                                            label="Update Availability"
                                            icon="pi pi-calendar"
                                            className="w-full"
                                            outlined
                                        />
                                        <Button
                                            label="View Earnings"
                                            icon="pi pi-chart-line"
                                            className="w-full"
                                            outlined
                                        />
                                        <Button
                                            label="Customer Reviews"
                                            icon="pi pi-star"
                                            className="w-full"
                                            outlined
                                        />
                                    </div>
                                </Card>

                                {/* Tips Card */}
                                <Card className="shadow-sm bg-blue-50 border-blue-200">
                                    <div className="flex gap-3">
                                        <i className="pi pi-info-circle text-blue-600 text-2xl"></i>
                                        <div>
                                            <h4 className="font-semibold text-blue-900 mb-2">Pro Tip</h4>
                                            <p className="text-sm text-blue-800">
                                                Respond to job requests within 15 minutes to increase your acceptance rate and customer satisfaction!
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </>
                ) : (
                    <Card className="shadow-sm bg-gray-50">
                        <div className="text-center py-12">
                            <i className="pi pi-lock text-6xl text-gray-400 mb-4"></i>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Dashboard Locked</h3>
                            <p className="text-gray-600 mb-4">
                                Your dashboard will be available once your documents are approved.
                            </p>
                            {provider.status === 'PENDING' && (
                                <p className="text-sm text-gray-500">
                                    Please upload your documents above to proceed with verification.
                                </p>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            <style jsx global>{`
                .p-menubar {
                    border-radius: 0;
                    border-left: none;
                    border-right: none;
                    border-top: none;
                }
                
                .p-card {
                    border-radius: 12px;
                }
                
                .p-card-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #111827;
                }
                
                .p-datatable {
                    font-size: 0.875rem;
                }
                
                .p-button {
                    border-radius: 8px;
                }
            `}</style>
        </>
    );
}