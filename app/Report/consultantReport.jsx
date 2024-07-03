'use client';
import { useAppSelector } from '@/redux/store';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';


const Report = () => {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const username = useAppSelector(state => state.authSlice.userName);
    const appRights = useAppSelector(state => state.authSlice.appRights);
    const consultantsData = [
        { id: 1, name: 'John Doe', category: 'Category A', experience: 5 },
        { id: 2, name: 'Jane Smith', category: 'Category B', experience: 8 },
        // Add more consultant data as needed
      ];
      
      const renderEditableRow = (rowData) => {
        return (
          <div>
            <InputText
              type="text"
              value={rowData.name}
              onChange={(e) => onNameChange(e, rowData)}
            />
          </div>
        );
      };
      
      const onNameChange = (e, rowData) => {
        // Handle changes to the editable field (e.g., update state or make API call)
      };
      
    return (
<DataTable value={consultantsData} rowGroupMode="subheader" groupField="category">
  <Column field="name" header="Name" />
  <Column field="experience" header="Experience" />
  <Column field="category" header="Category" />
  <Column field="edit" header="Edit" body={renderEditableRow} />
</DataTable>

    
    );
}

export default Report;
