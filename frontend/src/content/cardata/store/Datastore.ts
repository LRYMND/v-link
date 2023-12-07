import { create } from 'zustand'

const CarDataStore = create((set) => ({
    carData: {},
    updateData: (newData) => set((state) => ({ carData: { ...state.carData, ...newData } })),
  }));

export default CarDataStore;