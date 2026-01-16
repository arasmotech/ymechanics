'use client';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import statesData from '../../data/states.json';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Card } from 'primereact/card';

const StatesPage = () => {
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [states, setStates] = useState(statesData);
    const [stateDialogVisible, setStateDialogVisible] = useState(false);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        filters: {
            name: { value: '', matchMode: 'contains' }
        }
    });

    let networkTimeout = null;

    useEffect(() => {
        loadLazyData();
    }, [lazyState]);

    const loadLazyData = () => {
        setLoading(true);

        if (networkTimeout) {
            clearTimeout(networkTimeout);
        }

        //imitate delay of a backend call
        networkTimeout = setTimeout(() => {
            setTotalRecords(statesData.length);
            setStates(statesData);
            setLoading(false);
        }, 2000);
    };

    const onPage = (event) => {
        setLazyState(event);
    };

    const onSort = (event) => {
        setLazyState(event);
    };

    const onFilter = (event) => {
        event['first'] = 0;
        setLazyState(event);
    };

    const onAddState = () => {
        setStateDialogVisible(true);
        setCode('');
        setName('');
    }

    const onEditState = (rowData) => {
        setStateDialogVisible(true);
        setCode(rowData.code);
        setName(rowData.name);
    }

    const saveState = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'State saved successfully' });
        setStateDialogVisible(false);
    }


    return (
        <div className="card">
            <Toast ref={toast} />

            <Toolbar className="mb-4" start={<div className="text-2xl font-bold"><h1>States</h1></div>} end={<Button label='Add State' onClick={onAddState} icon="pi pi-plus" />} />
            <Card className="p-fluid m-4">

                <DataTable value={states} lazy dataKey="id" paginator
                    first={lazyState.first} rows={10} totalRecords={totalRecords} onPage={onPage}
                    onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder}
                    loading={loading} tableStyle={{ minWidth: '75rem' }}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}">
                    <Column field="code" header="Code" />
                    <Column field="name" header="Name" sortable />
                    <Column header="Actions" body={(rowData) => (
                        <Button icon="pi pi-pencil" onClick={() => onEditState(rowData)} className="p-button-rounded p-button-info" />
                    )}></Column>

                </DataTable>

            </Card>
            <Sidebar visible={stateDialogVisible} style={{ width: '450px' }} position='right' onHide={() => setStateDialogVisible(false)} className="p-sidebar-md">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-auto">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="stateCode" className="font-semibold text-gray-700 dark:text-gray-300">
                                    State Code <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="stateCode"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="e.g., CA"
                                    className="w-full"
                                    maxLength={2}
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <small className="text-gray-500 dark:text-gray-400">
                                    Enter a 2-letter state code
                                </small>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="stateName" className="font-semibold text-gray-700 dark:text-gray-300">
                                    State Name <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="stateName"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., California"
                                    className="w-full"
                                />
                                <small className="text-gray-500 dark:text-gray-400">
                                    Enter the full state name
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <div className="flex gap-3 justify-end">
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                className="p-button-text p-button-secondary"
                                onClick={() => setStateDialogVisible(false)}
                            />
                            <Button
                                label="Save State"
                                icon="pi pi-check"
                                className="p-button-primary"
                                onClick={saveState}
                                disabled={!code || !name}
                            />
                        </div>
                    </div>
                </div>
            </Sidebar>
        </div>
    );
}

export default StatesPage;