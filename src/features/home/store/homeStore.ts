import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Product, Category } from '../../../types';
import { RootState } from '../../../store/store';

interface HomeState {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: string | null;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
}

const initialState: HomeState = {
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  sortBy: null,
  page: 1,
  totalPages: 1,
  isLoading: false,
  isRefreshing: false,
  hasMore: true,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setFetchStart: (state, action: PayloadAction<{ refresh: boolean }>) => {
      state.isLoading = true;
      state.isRefreshing = action.payload.refresh;
    },
    setFetchSuccess: (
      state,
      action: PayloadAction<{ products: Product[]; page: number; totalPages: number; hasMore: boolean; refresh: boolean }>
    ) => {
      state.products = action.payload.refresh
        ? action.payload.products
        : [...state.products, ...action.payload.products];
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.hasMore = action.payload.hasMore;
      state.isLoading = false;
      state.isRefreshing = false;
    },
    setFetchFailed: (state) => {
      state.isLoading = false;
      state.isRefreshing = false;
    },
    setSelectedCategoryAction: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.page = 1;
      state.hasMore = true;
    },
    setSortByAction: (state, action: PayloadAction<string | null>) => {
      state.sortBy = action.payload;
      state.page = 1;
      state.hasMore = true;
    },
    setSearchQueryAction: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    searchProductsAction: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  setCategories,
  setFetchStart,
  setFetchSuccess,
  setFetchFailed,
  setSelectedCategoryAction,
  setSortByAction,
  setSearchQueryAction,
  searchProductsAction,
} = homeSlice.actions;

export const homeReducer = homeSlice.reducer;

export const useHomeStore = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.home);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.products.categories);
      dispatch(setCategories(response.data.data));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async (refresh = false) => {
    const { page, selectedCategory, searchQuery, sortBy, isLoading, hasMore } = state;
    if (isLoading) return;
    if (!refresh && !hasMore) return;

    const nextPage = refresh ? 1 : page;
    dispatch(setFetchStart({ refresh }));

    try {
      let response;
      if (searchQuery.trim().length > 0) {
        response = await apiClient.get(ENDPOINTS.products.search, {
          params: {
            q: searchQuery,
            page: nextPage,
            limit: 20,
            category: selectedCategory || undefined,
            sort: sortBy || undefined,
          },
        });
      } else {
        response = await apiClient.get(ENDPOINTS.products.list, {
          params: {
            page: nextPage,
            limit: 20,
            category: selectedCategory || undefined,
            sort: sortBy || undefined,
          },
        });
      }

      const { data: newProducts, pagination } = response.data;
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.page || nextPage;

      dispatch(
        setFetchSuccess({
          products: newProducts,
          page: currentPage + 1,
          totalPages,
          hasMore: currentPage < totalPages,
          refresh,
        })
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch(setFetchFailed());
    }
  };

  const searchProducts = async (query: string) => {
    dispatch(searchProductsAction(query));
    // Need to use updated local variables since dispatch is async
    const nextPage = 1;
    dispatch(setFetchStart({ refresh: true }));
    try {
      const response = await apiClient.get(ENDPOINTS.products.search, {
        params: {
          q: query,
          page: nextPage,
          limit: 20,
          category: state.selectedCategory || undefined,
          sort: state.sortBy || undefined,
        },
      });
      const { data: newProducts, pagination } = response.data;
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.page || nextPage;

      dispatch(
        setFetchSuccess({
          products: newProducts,
          page: currentPage + 1,
          totalPages,
          hasMore: currentPage < totalPages,
          refresh: true,
        })
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch(setFetchFailed());
    }
  };

  const setSelectedCategory = async (categoryId: string | null) => {
    dispatch(setSelectedCategoryAction(categoryId));
    const nextPage = 1;
    dispatch(setFetchStart({ refresh: true }));
    try {
      let response;
      if (state.searchQuery.trim().length > 0) {
        response = await apiClient.get(ENDPOINTS.products.search, {
          params: {
            q: state.searchQuery,
            page: nextPage,
            limit: 20,
            category: categoryId || undefined,
            sort: state.sortBy || undefined,
          },
        });
      } else {
        response = await apiClient.get(ENDPOINTS.products.list, {
          params: {
            page: nextPage,
            limit: 20,
            category: categoryId || undefined,
            sort: state.sortBy || undefined,
          },
        });
      }
      const { data: newProducts, pagination } = response.data;
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.page || nextPage;

      dispatch(
        setFetchSuccess({
          products: newProducts,
          page: currentPage + 1,
          totalPages,
          hasMore: currentPage < totalPages,
          refresh: true,
        })
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch(setFetchFailed());
    }
  };

  const setSortBy = async (sort: string | null) => {
    dispatch(setSortByAction(sort));
    const nextPage = 1;
    dispatch(setFetchStart({ refresh: true }));
    try {
      let response;
      if (state.searchQuery.trim().length > 0) {
        response = await apiClient.get(ENDPOINTS.products.search, {
          params: {
            q: state.searchQuery,
            page: nextPage,
            limit: 20,
            category: state.selectedCategory || undefined,
            sort: sort || undefined,
          },
        });
      } else {
        response = await apiClient.get(ENDPOINTS.products.list, {
          params: {
            page: nextPage,
            limit: 20,
            category: state.selectedCategory || undefined,
            sort: sort || undefined,
          },
        });
      }
      const { data: newProducts, pagination } = response.data;
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.page || nextPage;

      dispatch(
        setFetchSuccess({
          products: newProducts,
          page: currentPage + 1,
          totalPages,
          hasMore: currentPage < totalPages,
          refresh: true,
        })
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch(setFetchFailed());
    }
  };

  const setSearchQuery = (query: string) => {
    dispatch(setSearchQueryAction(query));
  };

  return {
    ...state,
    fetchCategories,
    fetchProducts,
    searchProducts,
    setSelectedCategory,
    setSortBy,
    setSearchQuery,
  };
};
