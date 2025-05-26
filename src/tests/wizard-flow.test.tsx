
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
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
  test('Contract Selection Flow', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Test different contract durations
    const contractOptions = [
      '12 meses', 
      '24 meses', 
      '36 meses', 
      '48 meses', 
      'Sem contrato'
    ];

    for (const option of contractOptions) {
      const contractButton = screen.getByText(option);
      await user.click(contractButton);
      
      // Verify selection persists
      expect(contractButton.closest('div')).toHaveClass('border-primary');
    }
  });

  // Memory Slider Tests
  test('Memory Slider Functionality', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    const memorySlider = screen.getByRole('slider');
    const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];

    for (const value of memoryValues) {
      await user.type(memorySlider, memoryValues.indexOf(value).toString());
      
      // Check displayed value
      expect(screen.getByText(`${value}GB RAM`)).toBeInTheDocument();
      
      // Check price calculation
      const expectedPrice = value * 7.5;
      expect(screen.getByText(new RegExp(`R\\$\\s*${expectedPrice.toFixed(2)}`))).toBeInTheDocument();
    }
  });

  // Processor Selection Tests
  test('Processor Selection', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    const processorOptions = serverData.componentes
      .find(c => c.type === 'Processador')?.options || [];

    for (const processor of processorOptions) {
      const processorOption = screen.getByText(processor.name);
      await user.click(processorOption);
      
      // Verify selection
      expect(processorOption.closest('div')).toHaveClass('ring-1 ring-primary');
    }
  });

  // Storage Configuration Tests
  test('Storage Configuration', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Test Internal Storage
    const internalTab = screen.getByText('Discos Internos');
    await user.click(internalTab);
    
    const diskTypes = ['NVMe', 'SSD', 'HDD'];
    for (const type of diskTypes) {
      const diskTypeOption = screen.getByText(type);
      await user.click(diskTypeOption);
      
      const capacities = screen.getAllByText(/\d+GB/);
      await user.click(capacities[0]);
    }

    // Test External Storage
    const externalTab = screen.getByText('Storage Externo');
    await user.click(externalTab);
    
    const storageTypes = ['Standard', 'SSD', 'Premium', 'NVMe'];
    for (const type of storageTypes) {
      const storageTypeOption = screen.getByText(type);
      await user.click(storageTypeOption);
    }
  });

  // Full Wizard Flow Test
  test('Complete Wizard Flow', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Simulate full wizard flow
    const steps = serverData.componentes;
    for (const [index, step] of steps.entries()) {
      // Select first option for each step
      const firstOption = step.options[0];
      const optionElement = screen.getByText(firstOption.name);
      await user.click(optionElement);
      
      // Move to next step
      const nextButton = screen.getByText('Próximo');
      await user.click(nextButton);
    }

    // Verify final summary
    expect(screen.getByText('Resumo do Seu Servidor')).toBeInTheDocument();
  });
});
