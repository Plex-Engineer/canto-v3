/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ToggleGroup from "@/components/groupToggle/ToggleGroup";

describe('ToggleGroup Component', () => {
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const setSelected = jest.fn();

  test('renders options correctly', () => {
    const selected = 'Option 1';
    const { getByText } = render(
      <ToggleGroup options={options} selected={selected} setSelected={setSelected} />
    );
    const optionElement1 = getByText('Option 1');
    expect(optionElement1).toBeInTheDocument();
    const optionElement2 = getByText('Option 2');
    expect(optionElement2).toBeInTheDocument();
    const optionElement3 = getByText('Option 3');
    expect(optionElement3).toBeInTheDocument();
  });

  test('applies selected class to the selected option', () => {
    const selected = 'Option 2';
    const { getByText } = render(
      <ToggleGroup options={options} selected={selected} setSelected={setSelected} />
    );
    const selectedOptionElement = getByText(selected).parentElement;
    expect(selectedOptionElement).toHaveClass("selected")
  });

  test('calls setSelected callback with the correct option when an option is clicked', () => {
    const selected = 'Option 1';
    const { getByText } = render(
      <ToggleGroup options={options} selected={selected} setSelected={setSelected} />
    );
    const optionToClick = 'Option 3';
    const optionToClickElement = getByText(optionToClick);
    fireEvent.click(optionToClickElement);
    expect(setSelected).toHaveBeenCalledWith(optionToClick);
  });

  
});
