import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import workorders from './example';

function Table(){
  const [tableRowsData, setTableRowsData] = useState(workorders);
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");

  const onChange = async (e) => {
    setTitle(e.target.value);
    console.log(e);
    var searchData = workorders.filter((item) => {
      if (
        item.title
          .toString()
          .toLowerCase()
          .includes(e.target.value.toLowerCase())
      ) {
        return item;
      }
    });
    setTableRowsData(searchData);
  };

//   const onChange2 = async (e) => {
//     setDirector(e.target.value);
//     console.log(e);
//     var searchData = workorders.filter((item) => {
//       if (
//         item.director
//           .toString()
//           .toLowerCase()
//           .includes(e.target.value.toLowerCase())
//       ) {
//         return item;
//       }
//     });
//     setTableRowsData(searchData);
//   };

  const headerResponsive = [
    {
        name: "S No.",
        selector: "id",
        sortable: true,
       // right: true
      },

    {
      name: (
        <div>
          Work Order Number
          <span><input
            type="text"
            placeholder="Search WO No."
            value={title}
            onChange={(e) => onChange(e)}
            style={{ width: "80%" }}
          /></span>
        </div>
      ),
      selector: "title",
      sortable: true
    },
    {
        name: "CSE",
        selector: "CSE_name",
        sortable: true,
      },
 
  
  ];

  useEffect(() => {}, [tableRowsData]);

  return (
    <DataTable
      columns={headerResponsive}
      data={tableRowsData}
      paginationPerPage = {2}
      pagination = {5}
      paginationRowsPerPageOptions = {[2,3,4]}
      defaultSortField="title"
    />
  );
}

export default Table;