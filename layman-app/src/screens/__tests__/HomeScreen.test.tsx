import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { fetchNews } from '../../services/newsService';
import { useTheme } from '../../context/ThemeContext';

// MOCK DEPENDENCIES
jest.mock('../../services/newsService');
jest.mock('../../context/ThemeContext');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('../../services/haptics', () => ({
  triggerLightHaptic: jest.fn(),
}));
jest.mock('../../services/notificationService', () => ({
  sendBreakingNewsNotification: jest.fn(),
}));

// MOCK NAVIGATION
const mockNavigation = {
  navigate: jest.fn(),
};

// MOCK DATA
const mockArticles = [
  { article_id: '1', title: 'Featured Article One', image_url: 'http://example.com/1.jpg' },
  { article_id: '2', title: 'Featured Article Two', image_url: 'http://example.com/2.jpg' },
  { article_id: '3', title: 'Featured Article Three', image_url: 'http://example.com/3.jpg' },
  { article_id: '4', title: 'Featured Article Four', image_url: 'http://example.com/4.jpg' },
  { article_id: '5', title: 'Regular Article Five', title_long: 'Regular Article Five Long Title' },
];

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default theme mock
    (useTheme as jest.Mock).mockReturnValue({
      colors: { background: '#FFF0E5', text: '#000', card: '#FFF' },
      isDark: false,
    });

    // Default fetch mock
    (fetchNews as jest.Mock).mockResolvedValue(mockArticles);
  });

  it('renders loading indicator initially', async () => {
    // Keep fetch pending for a moment
    (fetchNews as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<HomeScreen navigation={mockNavigation} />);
    
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders logo and articles list after loading', async () => {
    render(<HomeScreen navigation={mockNavigation} />);

    // Wait for the loading to finish and content to appear
    await waitFor(() => {
      expect(screen.getByText('Layman')).toBeTruthy();
    });

    // Check if featured articles are rendered
    expect(screen.getByText('Featured Article One')).toBeTruthy();
    
    // Check if regular articles are rendered
    expect(screen.getByText('Regular Article Five')).toBeTruthy();
  });

  it('shows error message if news fetch fails', async () => {
    (fetchNews as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<HomeScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy();
    });
  });
});
