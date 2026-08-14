import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminEtfDetailPage from '../pages/admin/AdminEtfDetailPage';

describe('AdminEtfDetail ZERO_VALUE_PERCENTAGE handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders the plain-language ZERO_VALUE_PERCENTAGE error inside the percentage section', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/etfs/1/history')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => []
        });
      }
      if (url.includes('/api/admin/etfs/1/adjust')) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({
            error: {
              code: 'ZERO_VALUE_PERCENTAGE',
              message: 'This ETF is zero...',
              details: null
            }
          })
        });
      }
      if (url.includes('/api/etfs/1')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            id: 1,
            name: 'Zero ETF',
            current_value: '0.00',
            previous_value: '0.00',
            last_change_amount: '0.00',
            last_change_percentage: '0.00',
            trend: 'FLAT',
            currency: 'USD',
            updated_at: new Date().toISOString()
          })
        });
      }
      
      return Promise.reject(new Error('Unmocked url: ' + url));
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/etfs/1']}>
        <Routes>
          <Route path="/admin/etfs/:id" element={<AdminEtfDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Zero ETF')).toBeInTheDocument();
    });
    
    const pctSection = screen.getByText('Adjust by Percentage').closest('section')!;
    
    expect(pctSection.textContent).toMatch(/set an absolute value first, then percentage changes will work/i);

    const pctInput = screen.getByLabelText('Percentage adjustment');
    await user.type(pctInput, '10');
    
    const pctForm = screen.getByRole('form', { name: /percentage/i });
    const applyButton = pctForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    await user.click(applyButton);
    
    await waitFor(() => {
      expect(within(pctForm).getByText(/set an absolute value first/i)).toBeInTheDocument();
    });

    expect(document.body.textContent).not.toMatch(/ZERO_VALUE_PERCENTAGE/);
  });
});
