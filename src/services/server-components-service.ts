
import { ServerConfiguration } from '@/types/component';
import { ComponentService } from '@/services/componentService';

export class ServerComponentsService {
  static async loadServerConfiguration(): Promise<ServerConfiguration> {
    try {
      console.log('[ServerComponentsService] Loading server configuration from database...');

      const [
        cpuComponents,
        memoryComponents,
        osComponents,
        connectivityComponents,
        dataCenters,
        contractTypes
      ] = await Promise.all([
        ComponentService.getCPUComponents(),
        ComponentService.getMemoryComponents(),
        ComponentService.getOSComponents(),
        ComponentService.getConnectivityComponents(),
        ComponentService.getDataCenters(),
        ComponentService.getContractTypes()
      ]);

      // Build the server configuration in the expected format
      const serverConfig: ServerConfiguration = {
        categoria: "Configuração do Servidor",
        componentes: [
          {
            id: "datacenter",
            type: "DataCenter",
            friendlyName: "Data Center",
            description: "Escolha a localização do seu servidor",
            icon: "building",
            options: dataCenters
          },
          {
            id: "contrato",
            type: "Contrato",
            friendlyName: "Tipo de Contrato",
            description: "Selecione a duração do contrato",
            icon: "contract",
            options: contractTypes
          },
          {
            id: "processador",
            type: "Processador",
            friendlyName: "Processador",
            description: "Escolha o processador para seu servidor",
            icon: "cpu",
            options: cpuComponents
          },
          {
            id: "memoria",
            type: "Memoria",
            friendlyName: "Memória RAM",
            description: "Configure a quantidade de memória RAM",
            icon: "memory",
            options: memoryComponents
          },
          {
            id: "armazenamento",
            type: "Armazenamento",
            friendlyName: "Armazenamento",
            description: "Configure os discos e storage do servidor",
            icon: "hard-drive",
            options: []
          },
          {
            id: "conectividade",
            type: "Conectividade",
            friendlyName: "Conectividade",
            description: "Configure portas de rede e blocos de IP",
            icon: "network",
            options: connectivityComponents
          },
          {
            id: "sistemaoperacional",
            type: "SistemaOperacional",
            friendlyName: "Sistema Operacional",
            description: "Escolha o sistema operacional",
            icon: "monitor",
            options: osComponents
          },
          {
            id: "servicospersonalizados",
            type: "ServicosPersonalizados",
            friendlyName: "Serviços Personalizados",
            description: "Adicione serviços extras (opcional)",
            icon: "settings",
            options: []
          }
        ]
      };

      console.log('[ServerComponentsService] Server configuration loaded successfully');
      return serverConfig;

    } catch (error) {
      console.error('[ServerComponentsService] Error loading server configuration:', error);
      throw error;
    }
  }
}
