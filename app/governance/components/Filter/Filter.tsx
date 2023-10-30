import React from 'react';
import './Filter.module.scss';

interface FilterProps {
  onFilterChange: (filter: string) => void;
}

const Filter: React.FC<FilterProps> = ({ onFilterChange }) => {
  return (
    <div className="filterContainer">
      <select onChange={(e) => onFilterChange(e.target.value)}>
        <option value="All">All</option>
        <option value="Rejected">Rejected</option>
        <option value="Passed">Passed</option>
        {/* Add other filter options as needed */}
      </select>
    </div>
  );
};

export default Filter;
