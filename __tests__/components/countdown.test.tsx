/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import Countdown from "@/components/timer/countdown";

jest.useFakeTimers();

describe('Countdown', () => {
  const RealDateNow = Date.now;

  beforeAll(() => {
    const mockDateNow = jest.fn(() => 0);
    global.Date.now = mockDateNow;
  });

  afterAll(() => {
    global.Date.now = RealDateNow;
  });

  it('renders the time left in the default format', () => {
    const { getByText } = render(<Countdown endTimestamp={BigInt(1000 * 60 * 60 * 24 * 2)} />);

    expect(getByText('2 Days : 0 Hours : 0 Minutes : 0 Seconds')).toBeInTheDocument();
  });

});