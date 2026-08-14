import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RequestPage from '../pages/RequestPage';

// Stub getEtfs
vi.mock('../api/etfs', () => ({
  getEtfs: vi.fn(() => Promise.resolve([
    { id: 1, name: 'Vanguard S&P 500', current_value: '400.00', currency: 'USD' }
  ]))
}));

describe('RequestPage Validation', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    createObjectURLMock = vi.fn(() => 'blob:test-url');
    revokeObjectURLMock = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;
  });

  it('Units `0` blocks submission with a message and no call', async () => {
    const user = userEvent.setup();
    render(<RequestPage />);
    
    // Wait for ETFs to load
    await waitFor(() => expect(screen.getByLabelText(/Select ETF/i)).toBeInTheDocument());
    
    // Select ETF
    await user.selectOptions(screen.getByLabelText(/Select ETF/i), '1');
    
    // Enter 0 units
    await user.type(screen.getByLabelText(/Units/i), '0');
    
    // Enter name
    await user.type(screen.getByLabelText(/Your Name/i), 'John Doe');
    
    // Attach photo
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const photoInput = screen.getByLabelText(/Verification Photo/i);
    await user.upload(photoInput, file);
    
    // Submit
    await user.click(screen.getByRole('button', { name: /Submit Request/i }));
    
    // Assert message
    expect(await screen.findByText('Units must be greater than zero.')).toBeInTheDocument();
    
    // Assert fetch was not called
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('Units `-1` blocks submission likewise', async () => {
    const user = userEvent.setup();
    render(<RequestPage />);
    
    await waitFor(() => expect(screen.getByLabelText(/Select ETF/i)).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText(/Select ETF/i), '1');
    await user.type(screen.getByLabelText(/Units/i), '-1');
    await user.type(screen.getByLabelText(/Your Name/i), 'John Doe');
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/Verification Photo/i), file);
    
    await user.click(screen.getByRole('button', { name: /Submit Request/i }));
    
    expect(await screen.findByText('Units must be greater than zero.')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('A complete form with no photo blocks submission with a photo-required message and no call', async () => {
    const user = userEvent.setup();
    render(<RequestPage />);
    
    await waitFor(() => expect(screen.getByLabelText(/Select ETF/i)).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText(/Select ETF/i), '1');
    await user.type(screen.getByLabelText(/Units/i), '10');
    await user.type(screen.getByLabelText(/Your Name/i), 'John Doe');
    
    await user.click(screen.getByRole('button', { name: /Submit Request/i }));
    
    expect(await screen.findByText('A photo is required.')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('A valid submission calls the network exactly once with a FormData body whose keys are exactly requester_name, etf_id, request_type, units, requester_image', async () => {
    const user = userEvent.setup();
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        etf_name: 'Vanguard S&P 500',
        request_type: 'BUY',
        units: '10',
        etf_value_snapshot: '400.00',
        total_value_snapshot: '4000.00',
        status: 'PENDING',
        currency: 'USD',
        created_at: new Date().toISOString()
      })
    });
    
    render(<RequestPage />);
    
    await waitFor(() => expect(screen.getByLabelText(/Select ETF/i)).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText(/Select ETF/i), '1');
    await user.type(screen.getByLabelText(/Units/i), '10');
    await user.type(screen.getByLabelText(/Your Name/i), 'John Doe');
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/Verification Photo/i), file);
    
    await user.click(screen.getByRole('button', { name: /Submit Request/i }));
    
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    
    const fetchArgs = fetchMock.mock.calls[0];
    const formData = fetchArgs[1].body as FormData;
    
    const keys = Array.from(formData.keys());
    expect(keys).toContain('requester_name');
    expect(keys).toContain('etf_id');
    expect(keys).toContain('request_type');
    expect(keys).toContain('units');
    expect(keys).toContain('requester_image');
    
    expect(keys).not.toContain('etf_value_snapshot');
    expect(keys).not.toContain('total_value_snapshot');
    expect(keys).not.toContain('status');
    expect(keys).not.toContain('created_at');
    
    expect(keys.length).toBe(5);
  });

  it('The confirmation renders the server\'s snapshot values, not the typed ones', async () => {
    const user = userEvent.setup();
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        etf_name: 'Vanguard S&P 500',
        request_type: 'BUY',
        units: '10',
        etf_value_snapshot: '450.00', // Deliberately different from 400.00
        total_value_snapshot: '4500.00',
        status: 'PENDING',
        currency: 'USD',
        created_at: new Date().toISOString()
      })
    });
    
    render(<RequestPage />);
    
    await waitFor(() => expect(screen.getByLabelText(/Select ETF/i)).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText(/Select ETF/i), '1');
    await user.type(screen.getByLabelText(/Units/i), '10');
    await user.type(screen.getByLabelText(/Your Name/i), 'John Doe');
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/Verification Photo/i), file);
    
    await user.click(screen.getByRole('button', { name: /Submit Request/i }));
    
    // Check for confirmation screen showing server price
    await waitFor(() => {
      // The formatting is '450.00', we should find this text (with MoneyValue it might be split up)
      expect(screen.getByText('450.00')).toBeInTheDocument();
      expect(screen.getByText('4,500.00')).toBeInTheDocument(); // Format decimal applies commas
    });
    
    // Check it's not showing the old indicative price (400)
    expect(screen.queryByText('400.00')).not.toBeInTheDocument();
  });
});
