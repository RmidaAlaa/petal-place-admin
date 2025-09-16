import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  vendor: string;
  category: string;
  addedAt: string;
}

interface FavoritesState {
  items: FavoriteItem[];
}

type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: Omit<FavoriteItem, 'addedAt'> }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: FavoriteItem[] };

const initialState: FavoritesState = {
  items: [],
};

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_FAVORITE': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Already in favorites
      }
      
      const newItem: FavoriteItem = {
        ...action.payload,
        addedAt: new Date().toISOString(),
      };
      
      return {
        ...state,
        items: [...state.items, newItem],
      };
    }

    case 'REMOVE_FAVORITE': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    }

    case 'CLEAR_FAVORITES': {
      return {
        ...state,
        items: [],
      };
    }

    case 'LOAD_FAVORITES': {
      return {
        ...state,
        items: action.payload,
      };
    }

    default:
      return state;
  }
};

interface FavoritesContextType {
  state: FavoritesState;
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
  loadFavorites: () => void;
  saveFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  const addFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    dispatch({ type: 'ADD_FAVORITE', payload: item });
  };

  const removeFavorite = (id: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: id });
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };

  const isFavorite = (id: string) => {
    return state.items.some(item => item.id === id);
  };

  const loadFavorites = () => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: 'LOAD_FAVORITES', payload: favorites });
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const saveFavorites = () => {
    try {
      localStorage.setItem('favorites', JSON.stringify(state.items));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  // Load favorites on mount
  React.useEffect(() => {
    loadFavorites();
  }, []);

  // Save favorites whenever they change
  React.useEffect(() => {
    saveFavorites();
  }, [state.items]);

  return (
    <FavoritesContext.Provider value={{
      state,
      addFavorite,
      removeFavorite,
      clearFavorites,
      isFavorite,
      loadFavorites,
      saveFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
