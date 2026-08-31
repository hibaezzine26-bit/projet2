import React from 'react';
import './Table.css';

const Table = ({ columns, data, loading, emptyMessage = 'Aucune donnée disponible.' }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-loading">
                <div className="loader"></div>
                Chargement des données...
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="animate-fade-in delay-1">
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
