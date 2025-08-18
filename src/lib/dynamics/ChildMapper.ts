import { Child, DynamicsChildrenResponse } from '@/types/Child';

/**
 * Mapeador para transformar dados do Dynamics CRM para o formato usado no frontend
 */
export class ChildMapper {
  /**
   * Mapeia um contato do Dynamics para o formato Child do frontend
   */
  static mapDynamicsContactToChild(contact: any): Child {
    // Calcula idade baseada na data de nascimento
    const calculateAge = (birthdate: string | undefined): number => {
      if (!birthdate) return 0;
      
      const birth = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return Math.max(0, age);
    };

    // Determina o gênero baseado nos campos disponíveis
    const getGender = (contact: any): 'M' | 'F' | 'Outro' => {
      if (contact.new_genero === 1 || contact.gendercode === 1) return 'F';
      if (contact.new_genero === 2 || contact.gendercode === 2) return 'M';
      if (contact.genero) {
        const genero = contact.genero.toLowerCase();
        if (genero.includes('fem') || genero === 'f') return 'F';
        if (genero.includes('mas') || genero === 'm') return 'M';
      }
      return 'Outro'; // default
    };

    // Monta localização baseada nos campos disponíveis
    const getLocation = (contact: any): string => {
      const cidade = contact.cidade || contact.address1_city || '';
      const estado = contact.estado || contact.address1_stateorprovince || '';
      
      if (cidade && estado) {
        return `${cidade}, ${estado}`;
      }
      return cidade || estado || contact.location || '';
    };

    // Obtém a melhor imagem disponível
    const getImage = (contact: any): string => {
      if (contact.chf_fotocrianca_url) return contact.chf_fotocrianca_url;
      if (contact.imagefotoperfil) return contact.imagefotoperfil;
      if (contact.new_imagefotoperfil) return contact.new_imagefotoperfil;
      if (contact.entityimage_url) return contact.entityimage_url;
      
      // Fallback para imagem padrão baseada no gênero
      const gender = getGender(contact);
      return gender === 'F' 
        ? "/criancas/placeholder-girl.jpg" 
        : "/criancas/placeholder-boy.jpg";
    };

    // Obtém o nome completo
    const getName = (contact: any): string => {
      if (contact.new_cfb_nome) return contact.new_cfb_nome;
      if (contact.fullname) return contact.fullname;
      if (contact.nome) return contact.nome;
      if (contact.firstname && contact.lastname) {
        return `${contact.firstname} ${contact.lastname}`;
      }
      return contact.firstname || contact.name || 'Criança';
    };

    // Monta história/descrição
    const getStory = (contact: any): string => {
      if (contact.descricao) return contact.descricao;
      if (contact.description) return contact.description;
      return `${getName(contact)} é uma criança especial que precisa do seu apoio.`;
    };

    // Mapeia necessidades básicas (pode ser expandido conforme necessário)
    const getNeeds = (contact: any): string[] => {
      const needs: string[] = [];
      
      // Lógica básica para determinar necessidades baseada nos dados disponíveis
      needs.push("Apoio educacional");
      needs.push("Apoio nutricional");
      
      if (contact.new_satussaudedacrianca && contact.new_satussaudedacrianca !== 1) {
        needs.push("Cuidados de saúde");
      }
      
      if (contact.new_comunidade) {
        needs.push("Desenvolvimento social");
      }
      
      return needs;
    };

    // Verifica se a criança está disponível para apadrinhamento
    const isAvailable = (contact: any): boolean => {
      // Se há um campo específico de bloqueio
      if (contact.new_statusbloqueado === true) return false;
      
      // Se há status específicos
      if (contact.new_statusram === 2) return false; // Exemplo: 2 = já apadrinhada
      if (contact.statuscode === 2) return false; // Inativo
      
      return true;
    };

    const birthdate = contact.birthdate || contact.new_datadenascimento || contact.new_cfb_datanascimento;
    const age = calculateAge(birthdate);

    const mappedChild: Child = {
      // Metadados OData
      '@odata.context': contact['@odata.context'],
      '@odata.etag': contact['@odata.etag'],
      
      // Identificadores
      id: contact.contactid || contact.id || '',
      contactid: contact.contactid,
      cre37_idcrianca: contact.cre37_idcrianca,
      new_idcriancaoracle: contact.new_idcriancaoracle,
      new_idcriancados: contact.new_idcriancados,
      
      // Dados pessoais
      name: getName(contact),
      firstname: contact.firstname,
      lastname: contact.lastname,
      fullname: contact.fullname,
      nome: contact.nome,
      new_cfb_nome: contact.new_cfb_nome,
      
      // Demografia
      age: age,
      birthdate: birthdate,
      new_datadenascimento: contact.new_datadenascimento,
      new_cfb_datanascimento: contact.new_cfb_datanascimento,
      gender: getGender(contact),
      genero: contact.genero,
      gendercode: contact.gendercode,
      new_genero: contact.new_genero,
      
      // Localização
      location: getLocation(contact),
      cep: contact.cep,
      logradouro: contact.logradouro,
      numero: contact.numero,
      complemento: contact.complemento,
      bairro: contact.bairro,
      cidade: contact.cidade,
      estado: contact.estado,
      address1_city: contact.address1_city,
      address1_stateorprovince: contact.address1_stateorprovince,
      address1_postalcode: contact.address1_postalcode,
      address1_line1: contact.address1_line1,
      
      // Mídia e descrição
      image: getImage(contact),
      imagefotoperfil: contact.imagefotoperfil,
      new_imagefotoperfil: contact.new_imagefotoperfil,
      entityimage_url: contact.entityimage_url,
      chf_fotocrianca: contact.chf_fotocrianca,
      chf_fotocrianca_url: contact.chf_fotocrianca_url,
      story: getStory(contact),
      descricao: contact.descricao,
      description: contact.description,
      
      // Status e controle
      isAvailable: isAvailable(contact),
      statuscode: contact.statuscode,
      statecode: contact.statecode,
      new_statusram: contact.new_statusram,
      new_statusbloqueado: contact.new_statusbloqueado,
      
      // Necessidades
      needs: getNeeds(contact),
      
      // Dados financeiros
      sponsorshipValue: contact.chf_valor || contact.chf_valor_base || contact.valor || "75",
      chf_valor: contact.chf_valor,
      chf_valor_base: contact.chf_valor_base,
      valor: contact.valor,
      
      // Informações específicas ChildFund
      new_comunidade: contact.new_comunidade,
      new_religiao: contact.new_religiao,
      new_cfb_religiao: contact.new_cfb_religiao,
      new_sabelereescrever: contact.new_sabelereescrever,
      new_idade_meses: contact.new_idade_meses,
      new_idade_sistema: contact.new_idade_sistema,
      new_idade_pessoa: contact.new_idade_pessoa,
      
      // Dados familiares
      new_cfb_filhosdependentes: contact.new_cfb_filhosdependentes,
      new_possuifilhos: contact.new_possuifilhos,
      numberofchildren: contact.numberofchildren,
      childrensnames: contact.childrensnames,
      
      // Informações médicas
      new_satussaudedacrianca: contact.new_satussaudedacrianca,
      new_tipodedoenca: contact.new_tipodedoenca,
      new_descrivo_doena: contact.new_descrivo_doena,
      new_relatriodedoenca: contact.new_relatriodedoenca,
      new_relatriodeprogresso: contact.new_relatriodeprogresso,
      
      // Controles internos
      new_integrar: contact.new_integrar,
      new_id_integracao_dimensao: contact.new_id_integracao_dimensao,
      versionnumber: contact.versionnumber,
      timezoneruleversionnumber: contact.timezoneruleversionnumber,
      
      // Dados de sincronização
      sinkcreatedon: contact.sinkcreatedon,
      sinkmodifiedon: contact.sinkmodifiedon,
      createdon: contact.createdon,
      modifiedon: contact.modifiedon,
      
      // Contatos
      emailaddress1: contact.emailaddress1,
      telephone1: contact.telephone1,
      new_cfb_telefone1: contact.new_cfb_telefone1,
      new_cfb_email: contact.new_cfb_email,
    };

    return mappedChild;
  }

  /**
   * Mapeia uma resposta completa do Dynamics para o formato esperado pelo frontend
   */
  static mapDynamicsResponse(response: any): DynamicsChildrenResponse {
    const mappedChildren = response.value?.map((contact: any) => 
      this.mapDynamicsContactToChild(contact)
    ) || [];

    return {
      '@odata.context': response['@odata.context'] || '',
      '@odata.count': response['@odata.count'],
      '@odata.nextLink': response['@odata.nextLink'],
      value: mappedChildren
    };
  }

  /**
   * Filtra crianças disponíveis para apadrinhamento
   */
  static filterAvailableChildren(children: Child[]): Child[] {
    return children.filter(child => child.isAvailable !== false);
  }

  /**
   * Agrupa crianças por estado
   */
  static groupChildrenByState(children: Child[]): Record<string, Child[]> {
    return children.reduce((groups, child) => {
      const state = child.estado || child.address1_stateorprovince || 'Outros';
      if (!groups[state]) {
        groups[state] = [];
      }
      groups[state].push(child);
      return groups;
    }, {} as Record<string, Child[]>);
  }

  /**
   * Filtra crianças por critérios específicos
   */
  static filterChildren(children: Child[], filters: {
    gender?: "all" | "M" | "F" | "Outro";
    ageMin?: number;
    ageMax?: number;
    state?: string;
    city?: string;
    availableOnly?: boolean;
  }): Child[] {
    return children.filter(child => {
      // Filtro por gênero
      if (filters.gender && filters.gender !== "all" && child.gender !== filters.gender) {
        return false;
      }

      // Filtro por idade mínima
      if (filters.ageMin !== undefined && child.age < filters.ageMin) {
        return false;
      }

      // Filtro por idade máxima
      if (filters.ageMax !== undefined && child.age > filters.ageMax) {
        return false;
      }

      // Filtro por estado
      if (filters.state && 
          (child.estado !== filters.state && child.address1_stateorprovince !== filters.state)) {
        return false;
      }

      // Filtro por cidade
      if (filters.city && 
          (child.cidade !== filters.city && child.address1_city !== filters.city)) {
        return false;
      }

      // Filtro por disponibilidade
      if (filters.availableOnly && !child.isAvailable) {
        return false;
      }

      return true;
    });
  }
} 