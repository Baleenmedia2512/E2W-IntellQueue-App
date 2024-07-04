'use client';
import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import {
  GroupingState,
  IntegratedGrouping,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableGroupRow,
} from '@devexpress/dx-react-grid-material-ui';

const consultants = [
  {
    "id": 1,
    "name": "John",
    "type": "USG",
    "subtype": "Brain",
    "count": 2
  },
  {
    "id": 1,
    "name": "John",
    "type": "USG",
    "subtype": "Abdomen",
    "count": 4
  },
  {
    "id": 1,
    "name": "John",
    "type": "CT",
    "subtype": "Pregnancy Test",
    "count": 5
  },
  {
    "id": 1,
    "name": "John",
    "type": "CT",
    "subtype": "X-Ray",
    "count": 2
  },
  {
    "id": 2,
    "name": "Cena",
    "type": "USG",
    "subtype": "Brain",
    "count": 4
  },
  {
    "id": 2,
    "name": "Cena",
    "type": "USG",
    "subtype": "Abdomen",
    "count": 1
  },
  {
    "id": 2,
    "name": "Cena",
    "type": "CT",
    "subtype": "Pregnancy Test",
    "count": 3
  },
  {
    "id": 2,
    "name": "Cena",
    "type": "CT",
    "subtype": "X-Ray",
    "count": 1
  }
];

const DataTable = () => {
  const [columns] = useState([
    { name: 'name', title: 'Name' },
    { name: 'type', title: 'Scans' },
    { name: 'subtype', title: 'Type' },
    { name: 'count', title: 'Count' },
  ]);

  return (
    <Paper>
      <Grid
        rows={consultants}
        columns={columns}
      >
        <GroupingState
          grouping={[
            { columnName: 'name' },
            { columnName: 'type' },
          ]}
        />
        <IntegratedGrouping />
        <Table />
        <TableHeaderRow />
        <TableGroupRow />
      </Grid>
    </Paper>
  );
};

export default DataTable;
