import React,{useState, useEffect, Fragment} from "react";
import Table from 'react-bootstrap/Table';

const CRUD = () =>
    {
    const OrderData = [
        {
            OrderNumber : 1,
            ClientName  : 'Kiruba',
            VendorName  : 'Baleen',
            AdMedium    : 'SunTV',
            isActive    : 1
    
        },
        {
            OrderNumber : 2,
            ClientName  : 'Balaji',
            VendorName  : 'Baleen',
            AdMedium    : 'SunTV',
            isActive    : 1
    
        },
        {
            OrderNumber : 3,
            ClientName  : 'Siva',
            VendorName  : 'Baleen',
            AdMedium    : 'SunTV',
            isActive    : 1
    
        }
        
    ]

    const [data, setData] = useState([]);

    useEffect(() => {
        setData(OrderData);
    },[])

return(
    <Fragment>
        <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Order Number</th>
          <th>Client Name</th>
          <th>Vendor Name</th>
          <th>Ad Medium</th>
          <th>isActive</th>
        </tr>
      </thead>
      <tbody>
        {
            data && data.length > 0 ? 
            data.map((item, index) => {
                return (
                    <tr key={index}>
                    <td>{index+ 1}</td>
                    <td>{item.OrderNumber}</td>
                    <td>{item.OrderNumber}</td>
                    <td>{item.ClientName}</td>
                    <td>{item.AdMedium}</td>
                    <td>{item.isActive}</td>
                  </tr>                
                )
            })
            :
            'Loading.... '
        }
       
      </tbody>
    </Table>

    </Fragment>
)

}

export default CRUD;