import { create } from 'zustand'

const defaultAssumptions = {
  cost_of_debt: 0.06,
  opex_rate: 0.01,
  tenor: 20,
  masa_operasi: 30,
  tahun_mulai: 2026,
  tahapan: [
    {
      nama: 'Tahap 1',
      capex: 0,
      tahun_mulai_konstruksi: 2027,
      durasi_konstruksi: 3,
      aktif: true,
    },
  ],
}

const useSimStore = create((set) => ({
  assumptions: { ...defaultAssumptions },
  results: null,
  isLoading: false,
  activePage: 'input', // 'input' | 'results'

  setAssumptions: (patch) =>
    set((state) => ({ assumptions: { ...state.assumptions, ...patch } })),

  addTahap: (item) =>
    set((state) => ({
      assumptions: {
        ...state.assumptions,
        tahapan: [...state.assumptions.tahapan, item],
      },
    })),

  removeTahap: (index) =>
    set((state) => ({
      assumptions: {
        ...state.assumptions,
        tahapan: state.assumptions.tahapan.filter((_, i) => i !== index),
      },
    })),

  setResults: (data) => set({ results: data }),
  setLoading: (bool) => set({ isLoading: bool }),
  setActivePage: (page) => set({ activePage: page }),
}))

export default useSimStore
