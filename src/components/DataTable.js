import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
  TextField, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function DataTable({ title, data = [], columns = [], onRowClick }) {
  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSort = (columnId) => {
    if (orderBy === columnId) {
      setOrderDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(columnId);
      setOrderDirection('asc');
    }
  };

  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item, navigate);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return columns.some(col => {
        if (col.searchable && item[col.id]) {
          return item[col.id].toString().toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
    });
  }, [data, columns, searchQuery]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      if (orderDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredData, orderBy, orderDirection]);

  return (
    <Paper sx={{ p: 2 }}>
      <h3>{title}</h3>

      {columns.some(col => col.searchable) && (
        <TextField
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.id}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? orderDirection : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map(item => (
              <TableRow 
                key={item.id}
                onClick={() => handleRowClick(item)}
                sx={{ 
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick ? {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  } : {}
                }}
              >
                {columns.map(col => (
                  <TableCell key={col.id}>
                    {col.id === 'message' || col.id === 'question'
                      ? <div dangerouslySetInnerHTML={{ __html: item[col.id] }} />
                      : item[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
