// components/VirtualizedList.jsx
import React, {useState} from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';

function VirtualizedList({ clientNameSuggestions, onClientNameSelection }) {
    const itemHeight = 36; // Height of a single item
    const listHeight = clientNameSuggestions.length * itemHeight; // Total height of the list

    const renderRow = ({ index, style }) => {
        const client = clientNameSuggestions[index];
        return (
        <ListItem 
            style={{ ...style, border: '1px solid #ccc', borderRadius: '4px', margin: '4px 0', cursor: 'pointer', transition: 'background-color 0.3s'}} 
            key={index} 
            component="div"
            disablePadding
        >
            <ListItemButton 
                onClick={() => onClientNameSelection(client)} 
             >
            <ListItemText primary={client} />
            </ListItemButton>
        </ListItem>
        );
    };

    return (
        <Box sx={{ width: '100%', height: listHeight, maxWidth: 360, bgcolor: 'background.paper' }}>
        {clientNameSuggestions.length > 0 && (
            <FixedSizeList
            height={listHeight}
            width={360}
            itemSize={itemHeight}
            itemCount={clientNameSuggestions.length}
            overscanCount={5}
            >
            {renderRow}
            </FixedSizeList>
        )}
        </Box>
    );
    }

export default VirtualizedList;