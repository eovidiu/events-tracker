import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useEvents, useCreateEvent } from '../../src/hooks/useEvents';
import * as api from '../../src/services/api';
// Mock the API module
vi.mock('../../src/services/api');
describe('useEvents', () => {
    let queryClient;
    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
    });
    afterEach(() => {
        queryClient.clear();
    });
    const wrapper = ({ children }) => client = { queryClient } > { children } < /QueryClientProvider>;
});
it('should fetch events successfully', async () => {
    const mockEvents = [
        {
            id: '880e8400-e29b-41d4-a716-446655440003',
            teamId: '660e8400-e29b-41d4-a716-446655440001',
            title: 'Team Offsite',
            description: 'Annual team building event',
            location: 'San Francisco',
            startDate: new Date('2025-02-01T10:00:00Z'),
            endDate: new Date('2025-02-01T18:00:00Z'),
            timezone: 'America/Los_Angeles',
            createdBy: '550e8400-e29b-41d4-a716-446655440000',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents });
    const { result } = renderHook(() => useEvents(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockEvents);
    expect(api.get).toHaveBeenCalledWith('/events');
});
it('should handle fetch errors', async () => {
    const mockError = new Error('Failed to fetch events');
    vi.mocked(api.get).mockRejectedValue(mockError);
    const { result } = renderHook(() => useEvents(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
});
describe('useCreateEvent', () => {
    let queryClient;
    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
    });
    afterEach(() => {
        queryClient.clear();
    });
    const wrapper = ({ children }) => client = { queryClient } > { children } < /QueryClientProvider>;
});
it('should create event successfully', async () => {
    const newEvent = {
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'New Event',
        description: 'Test event',
        location: 'Office',
        startDate: new Date('2025-03-01T10:00:00Z'),
        endDate: new Date('2025-03-01T12:00:00Z'),
        timezone: 'UTC',
    };
    const createdEvent = {
        id: '990e8400-e29b-41d4-a716-446655440004',
        ...newEvent,
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    vi.mocked(api.post).mockResolvedValue(createdEvent);
    const { result } = renderHook(() => useCreateEvent(), { wrapper });
    result.current.mutate(newEvent);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(createdEvent);
    expect(api.post).toHaveBeenCalledWith('/events', newEvent);
});
it('should handle validation errors', async () => {
    const invalidEvent = {
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        title: '',
        location: '',
        startDate: new Date('2025-03-01T10:00:00Z'),
        endDate: new Date('2025-03-01T08:00:00Z'), // Before start date
        timezone: 'UTC',
    };
    const mockError = new Error('Validation failed');
    vi.mocked(api.post).mockRejectedValue(mockError);
    const { result } = renderHook(() => useCreateEvent(), { wrapper });
    result.current.mutate(invalidEvent);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
});
it('should invalidate events query on success', async () => {
    const newEvent = {
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'New Event',
        location: 'Office',
        startDate: new Date('2025-03-01T10:00:00Z'),
        endDate: new Date('2025-03-01T12:00:00Z'),
        timezone: 'UTC',
    };
    const createdEvent = {
        id: '990e8400-e29b-41d4-a716-446655440004',
        ...newEvent,
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    vi.mocked(api.post).mockResolvedValue(createdEvent);
    const { result } = renderHook(() => useCreateEvent(), { wrapper });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    result.current.mutate(newEvent);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['events'] });
});
//# sourceMappingURL=useEvents.test.js.map