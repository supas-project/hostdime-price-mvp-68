import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WizardProvider } from '@/contexts/WizardContext';
import Index from '@/pages/Index';
import { serverData } from '@/data/server-components';

describe('Server Configuration Wizard', () => {
  const renderWizard = () => {
    return render(
      <WizardProvider>
        <Index />
      </WizardProvider>
    );
  };

  // Contract Selection Tests
  test('Contract Selection Flow', () => {
    renderWizard();
    
    // Test different contract durations
    const contractOptions = [
      '12 meses', 
      '24 meses', 
      '36 meses', 
      '48 meses', 
      'Sem contrato'
    ];

    contractOptions.forEach(option => {
      const contractButton = screen.getByText(option);
      fireEvent.click(contractButton);
      
      // Verify selection persists
      expect(contractButton.closest('div')).toHaveClass('border-primary');
    });
  });

  // Memory Slider Tests
  test('Memory Slider Functionality', () => {
    renderWizard();
    
    const memorySlider = screen.getByRole('slider');
    const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];

    memoryValues.forEach(value => {
      fireEvent.change(memorySlider, { target: { value: memoryValues.indexOf(value) } });
      
      // Check displayed value
      expect(screen.getByText(`${value}GB RAM`)).toBeInTheDocument();
      
      // Check price calculation
      const expectedPrice = value * 7.5;
      expect(screen.getByText(new RegExp(`R\\$\\s*${expectedPrice.toFixed(2)}`))).toBeInTheDocument();
    });
  });

  // Processor Selection Tests
  test('Processor Selection', () => {
    renderWizard();
    
    const processorOptions = serverData.componentes
      .find(c => c.type === 'Processador')?.options || [];

    processorOptions.forEach(processor => {
      const processorOption = screen.getByText(processor.name);
      fireEvent.click(processorOption);
      
      // Verify selection
      expect(processorOption.closest('div')).toHaveClass('ring-1 ring-primary');
    });
  });

  // Storage Configuration Tests
  test('Storage Configuration', () => {
    renderWizard();
    
    // Test Internal Storage
    const internalTab = screen.getByText('Discos Internos');
    fireEvent.click(internalTab);
    
    const diskTypes = ['NVMe', 'SSD', 'HDD'];
    diskTypes.forEach(type => {
      const diskTypeOption = screen.getByText(type);
      fireEvent.click(diskTypeOption);
      
      const capacities = screen.getAllByText(/\d+GB/);
      fireEvent.click(capacities[0]);
    });

    // Test External Storage
    const externalTab = screen.getByText('Storage Externo');
    fireEvent.click(externalTab);
    
    const storageTypes = ['Standard', 'SSD', 'Premium', 'NVMe'];
    storageTypes.forEach(type => {
      const storageTypeOption = screen.getByText(type);
      fireEvent.click(storageTypeOption);
    });
  });

  // Full Wizard Flow Test
  test('Complete Wizard Flow', () => {
    renderWizard();
    
    // Simulate full wizard flow
    const steps = serverData.componentes;
    steps.forEach((step, index) => {
      // Select first option for each step
      const firstOption = step.options[0];
      const optionElement = screen.getByText(firstOption.name);
      fireEvent.click(optionElement);
      
      // Move to next step
      const nextButton = screen.getByText('Próximo');
      fireEvent.click(nextButton);
    });

    // Verify final summary
    expect(screen.getByText('Resumo do Seu Servidor')).toBeInTheDocument();
  });
});
