/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from "@/components/table/table";

describe('Table', () => {
  const headers = [
    { value: 'Header 1', ratio: 1 },
    { value: 'Header 2', ratio: 2 },
  ];
  const content = [
    ['Row 1 Cell 1', 'Row 1 Cell 2'],
    ['Row 2 Cell 1', 'Row 2 Cell 2'],
  ];
  const onRowsClick = [jest.fn(), jest.fn()];

  it('renders the title', () => {
    render(<Table title="Test Title" headers={headers} content={content} headerFont="proto_mono" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the headers', () => {
    render(<Table headers={headers} content={content} headerFont="proto_mono" />);
    headers.forEach(header => {
      expect(screen.getByText(header.value)).toBeInTheDocument();
    });
  });

  it('renders the content', () => {
    render(<Table headers={headers} content={content} headerFont="proto_mono" />);
    content.forEach(row => {
      row.forEach(cell => {
        expect(screen.getByText(cell)).toBeInTheDocument();
      });
    });
  });

  it('does not render the headers when removeHeader is true', () => {
    render(<Table headers={headers} content={content} headerFont="proto_mono" removeHeader />);
    headers.forEach(header => {
      expect(screen.queryByText(header.value)).not.toBeInTheDocument();
    });
  });

});