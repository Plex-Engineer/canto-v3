import React from 'react';
import styles from './Filter.module.scss';

interface FilterProps {
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

const Filter: React.FC<FilterProps> = ({ onFilterChange, currentFilter }) => {
  const filters = ['All', 'Active','Rejected', 'Passed'];
  

  return (
    <div className={styles.filterContainer}>
      <div >
      {filters.map(filter => (
        <button
          key={filter}
          className={`${styles.button} ${currentFilter === filter ? styles.selected : ''}`}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
      </div>
    </div>
  );
};

export default Filter;
