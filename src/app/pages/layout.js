import { Menubar } from 'primereact/menubar';

const PageLayout = ({ children }) => {
    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            url: '/pages/dashboard'
        },
        {
            label: 'Admin',
            icon: 'pi pi-star',
            items: [
                {
                    label: 'Users',
                    icon: 'pi pi-users',
                    url: '/pages/users'
                },
                {
                    label: 'States',
                    icon: 'pi pi-map',
                    url: '/pages/states'
                },
                {
                    label: 'Cities',
                    icon: 'pi pi-building',
                    url: '/pages/cities'
                },
                {
                    label: 'Service Templates',
                    icon: 'pi pi-file',
                    url: '/pages/service-templates'
                },
                {
                    label: 'Services',
                    icon: 'pi pi-cog',
                    url: '/pages/services'
                }
            ]
        },
        {
            label: 'Providers',
            icon: 'pi pi-search',
            items: [
                {
                    label: 'Pending',
                    icon: 'pi pi-bolt',
                    url: '/pages/providers/pending'
                },
                {
                    label: 'Approved',
                    icon: 'pi pi-check'
                },
                {
                    label: 'Rejected',
                    icon: 'pi pi-times'
                }

            ]
        },
        {
            label: 'Contact',
            icon: 'pi pi-envelope'
        }
    ];
    return (
        <div className="page-layout">
            <Menubar model={items} />
            {children}
        </div>
    );
}

export default PageLayout;