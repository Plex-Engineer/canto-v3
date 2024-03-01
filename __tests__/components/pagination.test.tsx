/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from "@/components/pagination/Pagination";

describe('Pagination', () => {
  const handlePageClick = jest.fn();

  beforeEach(() => {
    handlePageClick.mockReset();
  });

  it('renders the page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} handlePageClick={handlePageClick} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('calls the handlePageClick function with the correct page number when a page number is clicked', () => {
    render(<Pagination currentPage={1} totalPages={5} handlePageClick={handlePageClick} />);
    fireEvent.click(screen.getByText('3'));
    expect(handlePageClick).toHaveBeenCalledWith(3);
  });

  it('calls the handlePageClick function with the next page number when the next button is clicked', () => {
    render(<Pagination currentPage={1} totalPages={5} handlePageClick={handlePageClick} />);
    fireEvent.click(screen.getByText('>'));
    expect(handlePageClick).toHaveBeenCalledWith(2);
  });

  it('calls the handlePageClick function with the previous page number when the previous button is clicked', () => {
    render(<Pagination currentPage={2} totalPages={5} handlePageClick={handlePageClick} />);
    fireEvent.click(screen.getByText('<'));
    expect(handlePageClick).toHaveBeenCalledWith(1);
  });

  it('does not call the handlePageClick function when the next button is clicked and the current page is the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} handlePageClick={handlePageClick} />);
    fireEvent.click(screen.getByText('>'));
    expect(handlePageClick).not.toHaveBeenCalled();
  });

  it('does not call the handlePageClick function when the previous button is clicked and the current page is the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} handlePageClick={handlePageClick} />);
    fireEvent.click(screen.getByText('<'));
    expect(handlePageClick).not.toHaveBeenCalled();
  });
});