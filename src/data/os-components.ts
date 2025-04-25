
import { ServerComponent } from "@/types/component";
import { Server } from "lucide-react";

export const osComponents: ServerComponent = {
  id: "os",
  type: "SistemaOperacional",
  friendlyName: "Sistema Operacional",
  description: "Escolha o sistema operacional para seu servidor",
  icon: "Server",
  options: [
    {
      id: "win-standard",
      name: "Windows Server Standard 2012/2016/2019",
      description: "Licença por core (a cada 2 cores)",
      price: 29.08,
      type: "SistemaOperacional",
      subtype: "windows",
      metadata: {
        perCore: true
      }
    },
    {
      id: "win-datacenter",
      name: "Windows Server Data Center 2012/2016/2019",
      description: "Licença por core (a cada 2 cores)",
      price: 201.96,
      type: "SistemaOperacional",
      subtype: "windows",
      metadata: {
        perCore: true
      }
    },
    {
      id: "almalinux-8",
      name: "AlmaLinux 8 (64bit)",
      description: "Sistema Linux empresarial de código aberto",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "almalinux-9",
      name: "AlmaLinux 9 (64bit)",
      description: "Sistema Linux empresarial de código aberto",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "centos-7",
      name: "CentOS 7 (64bit)",
      description: "Distribuição Linux empresarial",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "centos-8",
      name: "CentOS 8 (64bit)",
      description: "Distribuição Linux empresarial",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "cloudlinux-8",
      name: "CloudLinux 8 (64bit)",
      description: "Linux otimizado para hospedagem",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "cloudlinux-9",
      name: "CloudLinux 9 (64bit)",
      description: "Linux otimizado para hospedagem",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "debian",
      name: "Debian (64bit)",
      description: "Distribuição Linux universal",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "debian-10",
      name: "Debian 10 (64 Bit)",
      description: "Debian Buster",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "debian-11",
      name: "Debian 11 (64bit)",
      description: "Debian Bullseye",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "freebsd",
      name: "FreeBSD",
      description: "Sistema operacional Unix-like",
      price: 0,
      type: "SistemaOperacional",
      subtype: "unix"
    },
    {
      id: "freenas",
      name: "FreeNAS",
      description: "Sistema de armazenamento em rede",
      price: 0,
      type: "SistemaOperacional",
      subtype: "unix"
    },
    {
      id: "oracle-linux-8",
      name: "Oracle Linux 8",
      description: "Linux empresarial da Oracle",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "proxmox-7",
      name: "Proxmox VE 7",
      description: "Plataforma de virtualização",
      price: 0,
      type: "SistemaOperacional",
      subtype: "virtualization"
    },
    {
      id: "proxmox-8",
      name: "Proxmox VE 8",
      description: "Plataforma de virtualização",
      price: 0,
      type: "SistemaOperacional",
      subtype: "virtualization"
    },
    {
      id: "rocky-8",
      name: "Rocky Linux 8 (64bit)",
      description: "Linux empresarial de código aberto",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "rocky-9",
      name: "Rocky Linux 9 (64bit)",
      description: "Linux empresarial de código aberto",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "ubuntu-20-04",
      name: "Ubuntu 20.04 64bit",
      description: "Ubuntu LTS",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "ubuntu-22-04",
      name: "Ubuntu 22.04 64bit",
      description: "Ubuntu LTS",
      price: 0,
      type: "SistemaOperacional",
      subtype: "linux"
    },
    {
      id: "vmware-esxi",
      name: "VMware ESXi",
      description: "Hypervisor da VMware",
      price: 0,
      type: "SistemaOperacional",
      subtype: "virtualization"
    },
    {
      id: "vmware-esxi-67",
      name: "VMware ESXi 6.7",
      description: "Hypervisor da VMware",
      price: 0,
      type: "SistemaOperacional",
      subtype: "virtualization"
    },
    {
      id: "vmware-esxi-70",
      name: "VMware ESXi 7.0",
      description: "Hypervisor da VMware",
      price: 0,
      type: "SistemaOperacional",
      subtype: "virtualization"
    },
    {
      id: "xcp-ng",
      name: "XCP-NG 8.2",
      description: "Plataforma de virtualização",
      price: 0,
      type: "SistemaOperacional",
      subtype: "virtualization"
    },
    {
      id: "xenserver",
      name: "XenServer",
      description: "Plataforma de virtualização Citrix",
      price: 0,
      type: "SistemaOperacional",
      subtype: "virtualization"
    }
  ]
};

