
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { serverData } from "@/data/server-components";

// Initial data loaded from server components data
const initialPriceData: PriceData = {
  cpu: { 
    id: 'cpu', 
    name: 'Processadores', 
    items: serverData.componentes.find(c => c.type === "Processador")?.options?.map(option => ({
      id: option.id,
      name: option.name,
      description: option.description,
      price: option.price,
      specs: option.specs || [],
      type: option.type,
      subtype: option.subtype,
      metadata: option.metadata,
    })) || []
  },
  memory: { 
    id: 'memory', 
    name: 'Memória', 
    items: serverData.componentes.find(c => c.type === "Memória")?.options?.map(option => ({
      id: option.id,
      name: option.name,
      description: option.description,
      price: option.price,
      specs: option.specs || [],
      type: option.type,
      subtype: option.subtype,
      metadata: option.metadata,
    })) || []
  },
  disk: { id: 'disk', name: 'Discos', items: [] },
  chassis: { id: 'chassis', name: 'Chassi', items: [] },
  contract: { id: 'contract', name: 'Contratos', items: [] },
  os: { id: 'os', name: 'Sistemas Operacionais', items: [] },
  connectivity: { id: 'connectivity', name: 'Conectividade', items: [] }
};

// Storage keys
const PRICE_DATA_KEY = 'priceData';

// Load data from localStorage or use initial data
const loadDataFromStorage = (): PriceData => {
  try {
    const storedData = localStorage.getItem(PRICE_DATA_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading price data from storage:', error);
  }
  
  // Save initial data to localStorage if nothing exists
  localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(initialPriceData));
  return initialPriceData;
};

// Save data to localStorage
const saveDataToStorage = (data: PriceData): void => {
  try {
    localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving price data to storage:', error);
  }
};

// Generate a unique ID
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Functions to manipulate price data
export const PriceService = {
  // Get all price data
  getAllData: (): PriceData => {
    return loadDataFromStorage();
  },
  
  // Get a specific category
  getCategory: (categoryId: string): PriceCategory | null => {
    const data = loadDataFromStorage();
    return data[categoryId] || null;
  },
  
  // Add a new category
  addCategory: (category: Omit<PriceCategory, 'id'>): PriceCategory => {
    const data = loadDataFromStorage();
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    
    const newCategory: PriceCategory = {
      id,
      name: category.name,
      items: [],
    };
    
    data[id] = newCategory;
    saveDataToStorage(data);
    return newCategory;
  },
  
  // Update a category
  updateCategory: (categoryId: string, updates: Partial<PriceCategory>): PriceCategory => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    
    data[categoryId] = {
      ...data[categoryId],
      ...updates,
    };
    
    saveDataToStorage(data);
    return data[categoryId];
  },
  
  // Delete a category
  deleteCategory: (categoryId: string): void => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    
    delete data[categoryId];
    saveDataToStorage(data);
  },
  
  // Add an item to a category
  addItem: (categoryId: string, item: Omit<PriceItem, 'id'>): PriceItem => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    
    const newItem: PriceItem = {
      id: generateUniqueId(),
      ...item,
    };
    
    data[categoryId].items.push(newItem);
    saveDataToStorage(data);
    return newItem;
  },
  
  // Update an item
  updateItem: (categoryId: string, itemId: string, updates: Partial<PriceItem>): PriceItem => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    
    const itemIndex = data[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item with id ${itemId} not found in category ${categoryId}`);
    }
    
    data[categoryId].items[itemIndex] = {
      ...data[categoryId].items[itemIndex],
      ...updates,
    };
    
    saveDataToStorage(data);
    return data[categoryId].items[itemIndex];
  },
  
  // Delete an item
  deleteItem: (categoryId: string, itemId: string): void => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Category with id ${categoryId} not found`);
    }
    
    const itemIndex = data[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item with id ${itemId} not found in category ${categoryId}`);
    }
    
    data[categoryId].items.splice(itemIndex, 1);
    saveDataToStorage(data);
  },
  
  // Import data from JSON
  importFromJSON: (jsonData: string): PriceData => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Validate the structure
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Invalid JSON structure. Expected an object.');
      }
      
      // Merge with existing data
      const existingData = loadDataFromStorage();
      const mergedData = { ...existingData };
      
      Object.entries(parsedData).forEach(([categoryId, category]) => {
        // Validate category structure
        if (typeof category !== 'object' || !('items' in category) || !Array.isArray(category.items)) {
          throw new Error(`Invalid category structure for ${categoryId}`);
        }
        
        // Create or update the category
        mergedData[categoryId] = {
          id: categoryId,
          name: (category as PriceCategory).name || categoryId,
          items: (category as PriceCategory).items.map(item => ({
            id: item.id || generateUniqueId(),
            name: item.name,
            description: item.description || '',
            price: typeof item.price === 'number' ? item.price : 0,
            specs: Array.isArray(item.specs) ? item.specs : [],
            type: item.type || categoryId,
            subtype: item.subtype,
            metadata: item.metadata || {},
          })),
        };
      });
      
      saveDataToStorage(mergedData);
      return mergedData;
    } catch (error) {
      console.error('Error importing JSON data:', error);
      throw error;
    }
  },
  
  // Parse and import CSV data
  importFromCSV: (csvData: string): PriceData => {
    try {
      const lines = csvData.split('\n');
      
      // Extract header
      const header = lines[0].split(',').map(h => h.trim());
      
      // Check required columns
      const categoryIndex = header.findIndex(h => h.toLowerCase() === 'category');
      const nameIndex = header.findIndex(h => h.toLowerCase() === 'name');
      const descriptionIndex = header.findIndex(h => h.toLowerCase() === 'description');
      const priceIndex = header.findIndex(h => h.toLowerCase() === 'price');
      
      if (categoryIndex === -1 || nameIndex === -1 || priceIndex === -1) {
        throw new Error('CSV must contain at least category, name, and price columns');
      }
      
      // Process data rows
      const existingData = loadDataFromStorage();
      const mergedData: PriceData = { ...existingData };
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',').map(v => v.trim());
        
        const categoryId = values[categoryIndex].toLowerCase().replace(/\s+/g, '-');
        const name = values[nameIndex];
        const description = descriptionIndex !== -1 ? values[descriptionIndex] : '';
        const price = parseFloat(values[priceIndex]);
        
        if (isNaN(price)) {
          console.warn(`Skipping line ${i+1} due to invalid price: ${values[priceIndex]}`);
          continue;
        }
        
        // Create category if it doesn't exist
        if (!mergedData[categoryId]) {
          mergedData[categoryId] = {
            id: categoryId,
            name: values[categoryIndex], // Use original category name with proper casing
            items: [],
          };
        }
        
        // Add item to category
        mergedData[categoryId].items.push({
          id: generateUniqueId(),
          name,
          description,
          price,
          specs: [],
          type: categoryId,
        });
      }
      
      saveDataToStorage(mergedData);
      return mergedData;
    } catch (error) {
      console.error('Error importing CSV data:', error);
      throw error;
    }
  },
  
  // Reset data to initial state
  resetData: (): PriceData => {
    saveDataToStorage(initialPriceData);
    return initialPriceData;
  }
};
