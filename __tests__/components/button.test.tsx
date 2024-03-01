/**
 * @jest-environment jsdom
 */import '@testing-library/jest-dom';
import Button from "@/components/button/button";
import { render, fireEvent } from '@testing-library/react';
describe('Button Component', () => {
  // Rendering Test
  it('renders button component with text', () => {
    const { getByText } = render(<Button>Hello</Button>);
    const buttonElement = getByText('Hello');
    
    expect(buttonElement).toBeInTheDocument();
  });
  
  // onClick Prop Test
  it('calls onClick prop when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(<Button onClick={handleClick}>Click Me</Button>);
    const buttonElement = getByText('Click Me');
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Height Test
  it('applies correct height for small size', () => {
    const { getByText } = render(<Button height="small">Small Button</Button>);
    const buttonElement = getByText('Small Button');
    expect(buttonElement).toHaveStyle('height: 35px');
  });

  // Width Test
  it('applies correct width for fill width', () => {
    const { getByText } = render(<Button width="fill">Fill Width</Button>);
    const buttonElement = getByText('Fill Width');
    expect(buttonElement).toHaveStyle('width: 100%');
  });

  // Padding Test
  it('applies correct padding for medium padding', () => {
    const { getByText } = render(<Button padding="md">Medium Padding</Button>);
    const buttonElement = getByText('Medium Padding');
    expect(buttonElement).toHaveStyle('padding: 20px');
  });

  // Font Test
  it('applies correct font family for proto_mono', () => {
    const { getByText } = render(<Button fontFamily="proto_mono">Proto Mono Font</Button>);
    const buttonElement = getByText('Proto Mono Font');
    expect(buttonElement).toHaveStyle('font-family: var(--proto-mono)');
  });

  // Weight Test
  it('applies correct font weight for bold text', () => {
    const { getByText } = render(<Button weight="bold">Bold Text</Button>);
    const buttonElement = getByText('Bold Text');
    expect(buttonElement).toHaveStyle('font-weight: bold');
  });

  // Disabled Test
  it('disables button when disabled prop is true', () => {
    const { getByText } = render(<Button disabled={true}>Disabled Button</Button>);
    const buttonElement = getByText('Disabled Button');
    expect(buttonElement).toBeDisabled();
  });

  // Shadow Test
  it('applies correct shadow for medium shadow', () => {
    const { getByText } = render(<Button shadow="medium">Button with Shadow</Button>);
    const buttonElement = getByText('Button with Shadow');
    expect(buttonElement).toHaveStyle('box-shadow: 3px 3px 0px 0px rgba(17, 17, 17, 0.15)');
  });

  // Loading Test
  it('displays loading spinner when isLoading prop is true', () => {
    const { getByAltText } = render(<Button isLoading={true}>Loading Button</Button>);
    const loadingElement = getByAltText('loading');
    expect(loadingElement).toBeInTheDocument();
  });
});



