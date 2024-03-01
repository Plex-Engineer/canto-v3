/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from "@/components/tabs/tabs";

describe('Tabs', () => {
  const tabs = [
    { title: 'Tab 1', content: 'Content 1', onClick: jest.fn() },
    { title: 'Tab 2', content: 'Content 2', onClick: jest.fn() },
    { title: 'Tab 3', content: 'Content 3', onClick: jest.fn(), isDisabled: true },
  ];

  it('renders the tabs', () => {
    render(<Tabs tabs={tabs} />);
    tabs.forEach(tab => {
      expect(screen.getByText(tab.title)).toBeInTheDocument();
    });
  });

  it('renders the content of the active tab', () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('calls the correct function when a tab is clicked', () => {
    render(<Tabs tabs={tabs} />);
    const tabElements = screen.getAllByRole('button');
    fireEvent.click(tabElements[1]);
    expect(tabs[1].onClick).toHaveBeenCalled();
  });

  it('does not call the onClick function when a disabled tab is clicked', () => {
    render(<Tabs tabs={tabs} />);
    const tabElements = screen.getAllByRole('button');
    fireEvent.click(tabElements[2]);
    expect(tabs[2].onClick).not.toHaveBeenCalled();
  });

});