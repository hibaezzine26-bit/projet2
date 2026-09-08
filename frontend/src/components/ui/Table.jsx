import React from 'react';
import { Inbox } from 'lucide-react';
import './Table.css';

const Table = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'Aucune donnée disponible.',
  emptyIcon: EmptyIcon = Inbox,
  className = '',
  keyExtractor = (row, index) => row?.id || index,
}) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key || col.accessor || index}
                style={{ textAlign: col.align || 'left', width: col.width }}
                className={col.headerClassName || ''}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-state-cell">
                <div className="table-loader-wrap">
                  <div className="table-spinner" />
                  <span>Chargement des données en cours...</span>
                </div>
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={keyExtractor(row, rowIndex)} className="data-row">
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key || col.accessor || colIndex}
                    style={{ textAlign: col.align || 'left' }}
                    className={col.cellClassName || ''}
                  >
                    {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="table-state-cell">
                <div className="table-empty-wrap">
                  <EmptyIcon size={36} className="table-empty-icon" />
                  <p className="table-empty-text">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
