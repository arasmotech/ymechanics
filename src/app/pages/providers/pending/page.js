"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Image } from "primereact/image";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Carousel } from "primereact/carousel";
import { getSignedUrlGetFunction } from "@/lib/io";

export default function PendingProvidersPage() {
    const toast = useRef(null);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPendingProviders();
    }, []);

    useEffect(() => {
        console.log('Providers updated:', providers);
    }, [providers]);

    const fetchPendingProviders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/providers?status=PENDING', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                var providersList = data.data || [];
                for (const provider of providersList) {
                    if (provider.providerDocuments) {
                        for (const doc of provider.providerDocuments) {
                            const doc_url = await getSignedUrlGetFunction(doc.document_url);
                            doc.document_url = doc_url;
                            provider.providerDocuments[provider.providerDocuments.indexOf(doc)].document_url = doc_url;
                        }

                        // provider.providerDocuments = provider.providerDocuments.map(doc => ({
                        //     ...doc,
                        //     document_url: `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL}/${doc.document_url}`
                        // }));

                        providersList[providersList.indexOf(provider)].providerDocuments = provider.providerDocuments;
                        await setProviders(providersList);

                    }

                }



            } else {
                throw new Error(data.error || 'Failed to fetch providers');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to fetch pending providers',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (provider) => {
        confirmDialog({
            message: `Are you sure you want to approve ${provider.name}?`,
            header: 'Approve Provider',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            accept: () => updateProviderStatus(provider.id, 'APPROVED')
        });
    };

    const handleReject = (provider) => {
        confirmDialog({
            message: `Are you sure you want to reject ${provider.name}?`,
            header: 'Reject Provider',
            icon: 'pi pi-times-circle',
            acceptClassName: 'p-button-danger',
            accept: () => updateProviderStatus(provider.id, 'REJECTED')
        });
    };

    const updateProviderStatus = async (providerId, status) => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/v1/providers/${providerId}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update provider status');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: `Provider ${status.toLowerCase()} successfully`,
                life: 3000
            });

            // Refresh the list
            fetchPendingProviders();

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to update provider status',
                life: 5000
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewDocuments = (provider) => {
        setSelectedProvider(provider);
        setShowDocumentsDialog(true);
    };

    const statusBodyTemplate = (rowData) => {
        const severity = rowData.status === 'APPROVED' ? 'success' :
            rowData.status === 'REJECTED' ? 'danger' : 'warning';
        return <Tag value={rowData.status} severity={severity} />;
    };

    const actionsBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    outlined
                    severity="info"
                    onClick={() => handleViewDocuments(rowData)}
                    tooltip="View Documents"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-check"
                    rounded
                    outlined
                    severity="success"
                    onClick={() => handleApprove(rowData)}
                    tooltip="Approve"
                    tooltipOptions={{ position: 'top' }}
                    disabled={actionLoading}
                />
                <Button
                    icon="pi pi-times"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => handleReject(rowData)}
                    tooltip="Reject"
                    tooltipOptions={{ position: 'top' }}
                    disabled={actionLoading}
                />
            </div>
        );
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center gap-3">
                <Avatar
                    icon="pi pi-user"
                    size="large"
                    shape="circle"
                    style={{ backgroundColor: '#4F46E5', color: '#ffffff' }}
                />
                <div>
                    <div className="font-semibold">{rowData.name}</div>
                    <div className="text-sm text-gray-500">{rowData.email}</div>
                </div>
            </div>
        );
    };

    const locationBodyTemplate = (rowData) => {
        return (
            <div>
                <div className="font-medium">{rowData.city?.name}</div>
                <div className="text-sm text-gray-500">{rowData.state?.name}</div>
            </div>
        );
    };

    const contactBodyTemplate = (rowData) => {
        return (
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <i className="pi pi-phone text-sm"></i>
                    <span className="text-sm">{rowData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <i className="pi pi-map-marker text-sm"></i>
                    <span className="text-sm">{rowData.service_distance} km</span>
                </div>
            </div>
        );
    };

    const documentsBodyTemplate = (rowData) => {
        const count = rowData.providerDocuments?.length || 0;
        return (
            <Tag
                value={`${count} ${count === 1 ? 'document' : 'documents'}`}
                severity={count > 0 ? 'info' : 'warning'}
            />
        );
    };

    const documentItemTemplate = (document) => {
        console.log('Document:', document);
        const isImage = document.document_url.includes('.jpg') || document.document_url.includes('.jpeg') || document.document_url.includes('.png') || document.document_url.includes('.gif');
        const isPDF = document.document_url.includes('.pdf');

        return (
            <div className="p-4 border rounded-lg">
                {isImage ? (
                    <Image
                        src={document.document_url}
                        alt="Image Document"
                        width="100%"
                        preview
                        className="rounded"
                    />
                ) : isPDF ? (
                    <div className="text-center py-8">
                        <i className="pi pi-file-pdf text-6xl text-red-500 mb-3"></i>
                        <p className="text-sm text-gray-600 mb-3">PDF Document</p>
                        <Button
                            label="View PDF"
                            icon="pi pi-external-link"
                            onClick={() => window.open(document.document_url, '_blank')}
                            outlined
                        />
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <i className="pi pi-file text-6xl text-gray-400 mb-3"></i>
                        <p className="text-sm text-gray-600 mb-3">Document
                        </p>
                        <Button
                            label="Download"
                            icon="pi pi-download"
                            onClick={() => window.open(document.document_url, '_blank')}
                            outlined
                        />
                    </div>
                )}
            </div>
        );
    };

    const dialogFooter = (
        <div className="flex justify-between items-center w-full">
            <div>
                {selectedProvider && (
                    <span className="text-sm text-gray-600">
                        {selectedProvider.providerDocuments?.length || 0} document(s) uploaded
                    </span>
                )}
            </div>
            <div className="flex gap-2">
                <Button
                    label="Close"
                    icon="pi pi-times"
                    onClick={() => setShowDocumentsDialog(false)}
                    outlined
                />
                <Button
                    label="Approve Provider"
                    icon="pi pi-check"
                    severity="success"
                    onClick={() => {
                        setShowDocumentsDialog(false);
                        handleApprove(selectedProvider);
                    }}
                    disabled={!selectedProvider?.providerDocuments?.length}
                />
            </div>
        </div>
    );

    const header = (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Pending Providers</h2>
            <Button
                label="Refresh"
                icon="pi pi-refresh"
                onClick={fetchPendingProviders}
                outlined
                loading={loading}
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="p-6">
                <Card className="shadow-sm">
                    <DataTable
                        value={providers}
                        loading={loading}
                        header={header}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        emptyMessage="No pending providers found"
                        className="p-datatable-sm"
                    >
                        <Column
                            field="name"
                            header="Provider"
                            body={nameBodyTemplate}
                            sortable
                            style={{ minWidth: '250px' }}
                        />
                        <Column
                            field="location"
                            header="Location"
                            body={locationBodyTemplate}
                            sortable
                        />
                        <Column
                            field="contact"
                            header="Contact"
                            body={contactBodyTemplate}
                        />
                        <Column
                            field="documents"
                            header="Documents"
                            body={documentsBodyTemplate}
                            sortable
                        />
                        <Column
                            field="status"
                            header="Status"
                            body={statusBodyTemplate}
                            sortable
                        />
                        <Column
                            field="createdAt"
                            header="Applied On"
                            body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()}
                            sortable
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{ width: '150px' }}
                        />
                    </DataTable>
                </Card>
            </div>

            {/* Documents Dialog */}
            <Dialog
                header={
                    <div className="flex items-center gap-3">
                        <i className="pi pi-file text-2xl text-blue-600"></i>
                        <div>
                            <h3 className="font-bold text-xl">Provider Documents</h3>
                            <p className="text-sm text-gray-600 font-normal">
                                {selectedProvider?.name}
                            </p>
                        </div>
                    </div>
                }
                visible={showDocumentsDialog}
                style={{ width: '90vw', maxWidth: '800px' }}
                onHide={() => setShowDocumentsDialog(false)}
                footer={dialogFooter}
            >
                {selectedProvider && (
                    <div className="space-y-4">
                        {/* Provider Info */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-semibold">{selectedProvider.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-semibold">{selectedProvider.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="font-semibold">
                                        {selectedProvider.city?.name}, {selectedProvider.state?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Service Range</p>
                                    <p className="font-semibold">{selectedProvider.service_distance} km</p>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        {selectedProvider.providerDocuments && selectedProvider.providerDocuments.length > 0 ? (
                            <Carousel
                                value={selectedProvider.providerDocuments}
                                itemTemplate={documentItemTemplate}
                                numVisible={1}
                                numScroll={1}
                                circular
                                autoplayInterval={0}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <i className="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
                                <p className="text-gray-600">No documents uploaded yet</p>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            <style jsx global>{`
                .p-datatable .p-datatable-header {
                    background: white;
                    border: none;
                    padding: 1rem;
                }
                
                .p-datatable .p-datatable-tbody > tr > td {
                    padding: 1rem;
                }
                
                .p-carousel .p-carousel-content {
                    padding: 1rem 3rem;
                }
            `}</style>
        </>
    );
}
