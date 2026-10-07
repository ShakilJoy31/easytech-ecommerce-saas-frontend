import React, { ReactNode } from 'react';

export interface Column<T = any> {
  key: string;
  header: string | ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  minColumnWidth?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: number[];
  expandableRows?: boolean;
  expandedRowId?: number | string | null;
  renderExpandedRow?: (row: T) => React.ReactNode;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  showHeader?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
  emptyState?: React.ReactNode;
}

const TheTable: React.FC<TableProps> = ({ 
  columns, 
  data, 
  minColumnWidth = '120px',
  onRowClick,
  selectedRows = [],
  expandableRows = false,
  expandedRowId = null,
  renderExpandedRow,
  headerClassName = '',
  rowClassName = '',
  showHeader = true,
  stickyHeader = true,
  maxHeight = '600px',
  emptyState = null
}) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);

  // Check if mobile and handle resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure table always scrolls horizontally when needed
  React.useEffect(() => {
    const ensureScrollable = () => {
      if (tableContainerRef.current && tableRef.current) {
        // Force the container to allow horizontal scrolling
        tableContainerRef.current.style.overflowX = 'auto';
        tableContainerRef.current.style.overflowY = 'auto';
      }
    };

    ensureScrollable();
    window.addEventListener('resize', ensureScrollable);
    return () => window.removeEventListener('resize', ensureScrollable);
  }, [data, columns]);

  return (
    <div className="text-gray-200">
      <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#1e223a]">
        {/* Table container - always scrollable */}
        <div 
          ref={tableContainerRef}
          className="table-container"
          style={{
            maxHeight: maxHeight,
          }}
        >
          <table 
            ref={tableRef}
            className="min-w-full divide-y divide-gray-700"
            style={{ minWidth: '100%' }}
          >
            {/* Header */}
            {showHeader && (
              <thead className={`bg-[#1e223a] ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={column.key || index}
                      className={`px-4 py-3 ${index === 0 ? 'text-left' : 'text-center'} text-sm font-semibold text-gray-300 whitespace-nowrap border-b border-gray-700 ${headerClassName}`}
                      style={{ 
                        minWidth: column.width || minColumnWidth,
                        ...(column.width ? { width: column.width } : {})
                      }}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            
            {/* Body */}
            <tbody className="divide-y divide-gray-700 bg-[#1e223a]">
              {data.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr 
                    className={`
                      border-b border-gray-700 last:border-b-0 hover:bg-[#2a3150] transition-colors
                      ${selectedRows.includes((row as any).id) ? 'bg-blue-900/20' : ''}
                      ${typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 whitespace-nowrap text-gray-300 ${column.className || ''}`}
                        style={{ 
                          minWidth: column.width || minColumnWidth,
                          ...(column.width ? { width: column.width } : {})
                        }}
                      >
                        {column.render ? column.render(row, rowIndex) : (row as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded Row */}
                  {expandableRows && expandedRowId === (row as any).id && renderExpandedRow && (
                    <tr className="bg-[#2a3150]">
                      <td colSpan={columns.length} className="p-0 border-t border-gray-700">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {data.length === 0 && (
          <div className="text-center py-12 bg-[#1e223a] text-gray-400">
            {emptyState || (
              <>
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No Data Available</h3>
                <p className="text-gray-400">No records found matching your criteria</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .table-container {
          overflow: auto;
          /* Always allow scrolling when content overflows */
          -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
        }
        
        /* Hide scrollbar visually on mobile but keep functionality */
        @media (max-width: 768px) {
          .table-container::-webkit-scrollbar {
            display: none; /* Hide scrollbar visually */
          }
          .table-container {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        }
        
        /* Show scrollbar on desktop/tablet */
        @media (min-width: 769px) {
          .table-container::-webkit-scrollbar {
            width: 6px;
            height: 8px;
          }
          
          .table-container::-webkit-scrollbar-track {
            background: #2d3748;
            border-radius: 10px;
          }
          
          .table-container::-webkit-scrollbar-thumb {
            background: #4a5568;
            border-radius: 10px;
          }
          
          .table-container::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        }
      `}</style>
    </div>
  );
};

export default TheTable;