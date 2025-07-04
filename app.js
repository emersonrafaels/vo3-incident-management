// IBS 360 - Sistema de Gestão de Incidentes Itaú
class IBSApp {
    constructor() {
        this.incidents = [];
        this.filteredIncidents = [];
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.charts = {};
        this.reportCharts = {};
        this.filters = {
            equipment: '',
            severity: '',
            status: '',
            period: 90,
            search: ''
        };
        this.currentIncidentId = null;
        this.comments = {};
        this.communications = {};

        // Data from JSON with suppliers
        this.equipamentos = [
            {"nome": "Guia TV", "icon": "📺", "cor": "#4F46E5", "fornecedor": "TechDisplay Ltda"},
            {"nome": "ATM Saque", "icon": "🏧", "cor": "#059669", "fornecedor": "NCR Brasil"},
            {"nome": "ATM Depósito", "icon": "💳", "cor": "#DC2626", "fornecedor": "Diebold Nixdorf"},
            {"nome": "Notebook", "icon": "💻", "cor": "#7C3AED", "fornecedor": "Dell Technologies"},
            {"nome": "Link/Conectividade", "icon": "🌐", "cor": "#EA580C", "fornecedor": "Vivo Empresas"},
            {"nome": "WiFi", "icon": "📶", "cor": "#0891B2", "fornecedor": "Cisco Systems"},
            {"nome": "Equipamentos de Segurança", "icon": "🔒", "cor": "#BE123C", "fornecedor": "Intelbras Security"},
            {"nome": "Impressoras", "icon": "🖨️", "cor": "#65A30D", "fornecedor": "HP Brasil"},
            {"nome": "Tablets", "icon": "📱", "cor": "#C026D3", "fornecedor": "Samsung Electronics"},
            {"nome": "Ar Condicionado", "icon": "❄️", "cor": "#0369A1", "fornecedor": "Carrier Corporation"}
        ];

        this.severidades = [
            {"nome": "Crítico", "cor": "#DC2626", "prioridade": 1},
            {"nome": "Alto", "cor": "#EA580C", "prioridade": 2},
            {"nome": "Médio", "cor": "#CA8A04", "prioridade": 3},
            {"nome": "Baixo", "cor": "#0891B2", "prioridade": 4},
            {"nome": "Menor", "cor": "#059669", "prioridade": 5}
        ];

        this.status = [
            {"nome": "Aberto", "cor": "#DC2626"},
            {"nome": "Em Andamento", "cor": "#EA580C"},
            {"nome": "Aguardando", "cor": "#CA8A04"},
            {"nome": "Resolvido", "cor": "#059669"},
            {"nome": "Fechado", "cor": "#6B7280"}
        ];

        this.agencias = [
            "1001 - Vila Olímpia", "1002 - Faria Lima", "1003 - Paulista", "1004 - Moema",
            "1005 - Itaim Bibi", "1006 - Brooklin", "1007 - Santo Amaro", "1008 - Pinheiros",
            "1009 - Vila Madalena", "1010 - Perdizes", "2001 - Copacabana", "2002 - Ipanema",
            "2003 - Leblon", "2004 - Barra da Tijuca", "2005 - Tijuca", "3001 - Savassi BH",
            "3002 - Centro BH", "4001 - Boa Viagem", "4002 - Casa Forte", "5001 - Meireles",
            "5002 - Aldeota"
        ];

        this.agenciaCoords = {
            "1001 - Vila Olímpia": [-23.5955, -46.6874],
            "1002 - Faria Lima": [-23.5693, -46.7001],
            "1003 - Paulista": [-23.5617, -46.6559],
            "1004 - Moema": [-23.6019, -46.6735],
            "1005 - Itaim Bibi": [-23.5874, -46.674],
            "1006 - Brooklin": [-23.6221, -46.6971],
            "1007 - Santo Amaro": [-23.6561, -46.7132],
            "1008 - Pinheiros": [-23.5687, -46.6959],
            "1009 - Vila Madalena": [-23.5721, -46.695],
            "1010 - Perdizes": [-23.5353, -46.6683],
            "2001 - Copacabana": [-22.9719, -43.1822],
            "2002 - Ipanema": [-22.9836, -43.2048],
            "2003 - Leblon": [-22.9832, -43.2237],
            "2004 - Barra da Tijuca": [-23.0003, -43.3609],
            "2005 - Tijuca": [-22.9252, -43.2315],
            "3001 - Savassi BH": [-19.9318, -43.9392],
            "3002 - Centro BH": [-19.9191, -43.9386],
            "4001 - Boa Viagem": [-8.1222, -34.9156],
            "4002 - Casa Forte": [-8.0351, -34.9111],
            "5001 - Meireles": [-3.7225, -38.4934],
            "5002 - Aldeota": [-3.7363, -38.4885]
        };

        this.responsaveis = [
            "João Silva - Técnico TI", "Maria Santos - Suporte N2", "Pedro Costa - Especialista ATM",
            "Ana Oliveira - Técnico Redes", "Carlos Lima - Suporte Segurança", "Fernanda Alves - Técnico Hardware",
            "Ricardo Souza - Especialista Conectividade", "Juliana Pereira - Suporte N1", 
            "Bruno Martins - Técnico Audiovisual", "Camila Rocha - Especialista Climatização"
        ];

        this.templatesMensagens = [
            "Favor verificar funcionamento do equipamento com urgência",
            "Solicitamos manutenção preventiva do equipamento",
            "Equipamento apresentando falhas intermitentes",
            "Necessária substituição de componente defeituoso",
            "Favor atualizar software/firmware do equipamento"
        ];

        this.usuarios = [
            "Carlos Mendes - Analista NOC", "Fernanda Silva - Supervisora Técnica",
            "Roberto Lima - Coordenador Operacional", "Ana Costa - Analista de Suporte"
        ];

        this.maps = {};
        this.heatLayer = null;

        this.init();
    }

    init() {
        this.generateMockData();
        this.generateMockComments();
        this.generateMockCommunications();
        this.setupEventListeners();
        this.setupFilters();
        this.applyFilters();
        this.updateDashboard();
        
        // Wait for DOM to be ready before creating charts
        setTimeout(() => {
            this.createCharts();
        }, 100);

        this.setupThemeToggle();
    }

    generateMockData() {
        const incidents = [];
        const now = new Date();
        
        for (let i = 0; i < 280; i++) {
            const equipment = this.equipamentos[Math.floor(Math.random() * this.equipamentos.length)];
            const severity = this.severidades[Math.floor(Math.random() * this.severidades.length)];
            const statusObj = this.status[Math.floor(Math.random() * this.status.length)];
            const agency = this.agencias[Math.floor(Math.random() * this.agencias.length)];
            const responsible = this.responsaveis[Math.floor(Math.random() * this.responsaveis.length)];
            
            // Generate random date within last 90 days
            const daysAgo = Math.floor(Math.random() * 90);
            const hoursAgo = Math.floor(Math.random() * 24);
            const minutesAgo = Math.floor(Math.random() * 60);
            
            const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
            
            // Calculate resolution time based on severity
            let resolutionHours = 0;
            const isResolved = statusObj.nome === 'Resolvido' || statusObj.nome === 'Fechado';
            
            if (isResolved) {
                switch (severity.nome) {
                    case 'Crítico': resolutionHours = Math.random() * 4 + 1; break;
                    case 'Alto': resolutionHours = Math.random() * 12 + 2; break;
                    case 'Médio': resolutionHours = Math.random() * 24 + 4; break;
                    case 'Baixo': resolutionHours = Math.random() * 48 + 8; break;
                    case 'Menor': resolutionHours = Math.random() * 72 + 12; break;
                }
            }
            
            const resolutionDate = isResolved ? new Date(startDate.getTime() + (resolutionHours * 60 * 60 * 1000)) : null;
            
            // Detection time (how long it took to detect the issue)
            const detectionMinutes = Math.random() * 60 + 5;
            
            const incident = {
                id: `INC-${String(i + 1).padStart(4, '0')}`,
                equipment: equipment.nome,
                equipmentIcon: equipment.icon,
                equipmentColor: equipment.cor,
                supplier: equipment.fornecedor,
                agency: agency,
                severity: severity.nome,
                severityColor: severity.cor,
                severityPriority: severity.prioridade,
                status: statusObj.nome,
                statusColor: statusObj.cor,
                startDate: startDate,
                resolutionDate: resolutionDate,
                responsible: responsible,
                mttr: resolutionHours, // Mean Time To Resolution
                mttd: detectionMinutes / 60, // Mean Time To Detection in hours
                description: this.generateIncidentDescription(equipment.nome, severity.nome)
            };
            
            incidents.push(incident);
        }
        
        this.incidents = incidents.sort((a, b) => b.startDate - a.startDate);
    }

    generateMockComments() {
        const usuarios = this.usuarios;
        const comentariosTipo = ['interno', 'fornecedor', 'tecnico'];
        const comentariosExemplo = [
            'Equipamento apresentando problemas intermitentes. Solicitando verificação.',
            'Realizei reinicialização do sistema. Monitorando comportamento.',
            'Problema identificado no módulo principal. Necessária intervenção.',
            'Cliente reportou melhoria após última atualização.',
            'Agendamento de manutenção preventiva necessário.',
            'Sistema funcionando normalmente após intervenção.',
            'Detectado problema de conectividade. Investigando causa raiz.'
        ];

        // Generate comments for some incidents
        for (let i = 0; i < 50; i++) {
            const incident = this.incidents[Math.floor(Math.random() * Math.min(this.incidents.length, 30))];
            const incidentId = incident.id;
            
            if (!this.comments[incidentId]) {
                this.comments[incidentId] = [];
            }

            const numComments = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < numComments; j++) {
                const commentDate = new Date(incident.startDate.getTime() + (j * 2 * 60 * 60 * 1000));
                const comment = {
                    id: `COMM-${Date.now()}-${Math.random()}`,
                    type: comentariosTipo[Math.floor(Math.random() * comentariosTipo.length)],
                    text: comentariosExemplo[Math.floor(Math.random() * comentariosExemplo.length)],
                    author: usuarios[Math.floor(Math.random() * usuarios.length)],
                    timestamp: commentDate
                };
                this.comments[incidentId].push(comment);
            }
        }
    }

    generateMockCommunications() {
        const statusTypes = ['enviado', 'lido', 'respondido'];
        const subjects = [
            'Verificação urgente de equipamento',
            'Solicitação de manutenção preventiva',
            'Relatório de falha crítica',
            'Atualização de firmware necessária',
            'Substituição de componente'
        ];

        // Generate communications for some incidents
        for (let i = 0; i < 30; i++) {
            const incident = this.incidents[Math.floor(Math.random() * Math.min(this.incidents.length, 20))];
            const incidentId = incident.id;
            
            if (!this.communications[incidentId]) {
                this.communications[incidentId] = [];
            }

            const numCommunications = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numCommunications; j++) {
                const commDate = new Date(incident.startDate.getTime() + (j * 4 * 60 * 60 * 1000));
                const communication = {
                    id: `COMM-${Date.now()}-${Math.random()}`,
                    subject: subjects[Math.floor(Math.random() * subjects.length)],
                    message: `Comunicação relacionada ao incidente ${incidentId}. Favor verificar e providenciar solução conforme procedimentos estabelecidos.`,
                    priority: ['baixa', 'media', 'alta'][Math.floor(Math.random() * 3)],
                    status: statusTypes[Math.floor(Math.random() * statusTypes.length)],
                    timestamp: commDate,
                    supplier: incident.supplier
                };
                this.communications[incidentId].push(communication);
            }
        }
    }

    generateIncidentDescription(equipment, severity) {
        const descriptions = {
            "Guia TV": [
                "Tela apresentando falha na exibição de informações",
                "Sistema de guia não responde ao toque",
                "Conteúdo desatualizado na tela principal"
            ],
            "ATM Saque": [
                "Falha na dispensação de cédulas",
                "Erro de comunicação com sistema central",
                "Travamento durante transação de saque"
            ],
            "ATM Depósito": [
                "Problema no mecanismo de depósito",
                "Falha na leitura de cheques",
                "Erro na contagem de cédulas"
            ],
            "Notebook": [
                "Sistema operacional apresentando lentidão",
                "Falha na inicialização do sistema",
                "Problema de conectividade com rede"
            ],
            "Link/Conectividade": [
                "Perda de conexão com internet",
                "Latência elevada na rede",
                "Falha no link principal de dados"
            ],
            "WiFi": [
                "Rede sem fio indisponível",
                "Sinal fraco em determinadas áreas",
                "Problema de autenticação na rede"
            ],
            "Equipamentos de Segurança": [
                "Falha na câmera de segurança",
                "Sensor de movimento não funcionando",
                "Problema no sistema de alarme"
            ],
            "Impressoras": [
                "Atolamento de papel frequente",
                "Qualidade de impressão degradada",
                "Falha na comunicação com sistema"
            ],
            "Tablets": [
                "Tela touch não responsiva",
                "Bateria não carregando adequadamente",
                "Aplicativo travando constantemente"
            ],
            "Ar Condicionado": [
                "Temperatura ambiente inadequada",
                "Ruído excessivo no equipamento",
                "Falha no sistema de refrigeração"
            ]
        };
        
        const equipmentDescriptions = descriptions[equipment] || ["Falha geral no equipamento"];
        return equipmentDescriptions[Math.floor(Math.random() * equipmentDescriptions.length)];
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Filters
        document.getElementById('equipmentFilter').addEventListener('change', (e) => {
            this.filters.equipment = e.target.value;
            this.applyFilters();
        });

        document.getElementById('severityFilter').addEventListener('change', (e) => {
            this.filters.severity = e.target.value;
            this.applyFilters();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('periodFilter').addEventListener('change', (e) => {
            this.filters.period = parseInt(e.target.value);
            this.applyFilters();
        });

        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateTable();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredIncidents.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateTable();
            }
        });

        // Modal tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Modals
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('incidentModal').classList.add('hidden');
        });

        document.getElementById('closeSupplierModal').addEventListener('click', () => {
            document.getElementById('supplierModal').classList.add('hidden');
        });

        // Click outside modal to close
        document.getElementById('incidentModal').addEventListener('click', (e) => {
            if (e.target.id === 'incidentModal') {
                document.getElementById('incidentModal').classList.add('hidden');
            }
        });

        document.getElementById('supplierModal').addEventListener('click', (e) => {
            if (e.target.id === 'supplierModal') {
                document.getElementById('supplierModal').classList.add('hidden');
            }
        });

        // Comments functionality
        document.getElementById('saveComment').addEventListener('click', () => {
            this.saveComment();
        });

        document.getElementById('sendToSupplier').addEventListener('click', () => {
            this.sendCommentToSupplier();
        });

        // Communications functionality
        document.getElementById('newCommunication').addEventListener('click', () => {
            this.openSupplierModal();
        });

        // Supplier modal functionality
        document.getElementById('communicationTemplate').addEventListener('change', (e) => {
            this.fillTemplate(e.target.value);
        });

        document.getElementById('cancelCommunication').addEventListener('click', () => {
            document.getElementById('supplierModal').classList.add('hidden');
        });

        document.getElementById('sendCommunication').addEventListener('click', () => {
            this.sendCommunication();
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        const ltFilter = document.getElementById('longTailStatusFilter');
        if (ltFilter) {
            ltFilter.addEventListener('change', () => {
                if (this.charts.longTail) this.updateLongTailChart();
            });
        }

        const ltFilterReport = document.getElementById('longTailStatusFilterReport');
        if (ltFilterReport) {
            ltFilterReport.addEventListener('change', () => {
                if (this.reportCharts.longTail) this.updateLongTailChartReport();
            });
        }

        const mapFilter = document.getElementById('mapStatusFilter');
        if (mapFilter) {
            mapFilter.addEventListener('change', () => {
                if (this.maps.agency) this.updateAgencyMap();
            });
        }

        const themeSelect = document.getElementById('defaultTheme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                document.body.dataset.colorScheme = value;
                localStorage.setItem('theme', value);
            });
        }
    }

    setupFilters() {
        // Equipment filter
        const equipmentFilter = document.getElementById('equipmentFilter');
        this.equipamentos.forEach(eq => {
            const option = document.createElement('option');
            option.value = eq.nome;
            option.textContent = `${eq.icon} ${eq.nome}`;
            equipmentFilter.appendChild(option);
        });

        // Severity filter
        const severityFilter = document.getElementById('severityFilter');
        this.severidades.forEach(sev => {
            const option = document.createElement('option');
            option.value = sev.nome;
            option.textContent = sev.nome;
            severityFilter.appendChild(option);
        });

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        this.status.forEach(st => {
            const option = document.createElement('option');
            option.value = st.nome;
            option.textContent = st.nome;
            statusFilter.appendChild(option);
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).parentElement.classList.add('active');

        // Show/hide sections
        if (section === 'incidents') {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('incidents-section').style.display = 'block';
            document.getElementById('reports-section').style.display = 'none';
            document.getElementById('settings-section').style.display = 'none';
            this.updateTable();
        } else if (section === 'reports') {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('incidents-section').style.display = 'none';
            document.getElementById('reports-section').style.display = 'block';
            document.getElementById('settings-section').style.display = 'none';
            if (!this.maps.agency) {
                this.createAgencyMap();
            } else {
                setTimeout(() => this.maps.agency.invalidateSize(), 100);
            }
            this.updateReports();
        } else if (section === 'settings') {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('incidents-section').style.display = 'none';
            document.getElementById('reports-section').style.display = 'none';
            document.getElementById('settings-section').style.display = 'block';
        } else {
            document.getElementById('dashboard-section').style.display = 'block';
            document.getElementById('incidents-section').style.display = 'none';
            document.getElementById('reports-section').style.display = 'none';
            document.getElementById('settings-section').style.display = 'none';
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        // Load content based on tab
        if (tab === 'comments') {
            this.loadComments();
        } else if (tab === 'communications') {
            this.loadCommunications();
        }
    }

    applyFilters() {
        const now = new Date();
        const periodStart = new Date(now.getTime() - (this.filters.period * 24 * 60 * 60 * 1000));

        const search = this.filters.search.toLowerCase();
        this.filteredIncidents = this.incidents.filter(incident => {
            const matchesPeriod = incident.startDate >= periodStart;
            const matchesEquipment = !this.filters.equipment || incident.equipment === this.filters.equipment;
            const matchesSeverity = !this.filters.severity || incident.severity === this.filters.severity;
            const matchesStatus = !this.filters.status || incident.status === this.filters.status;
            const matchesSearch = !search ||
                incident.id.toLowerCase().includes(search) ||
                incident.description.toLowerCase().includes(search) ||
                incident.agency.toLowerCase().includes(search);

            return matchesPeriod && matchesEquipment && matchesSeverity && matchesStatus && matchesSearch;
        });

        this.currentPage = 1;
        this.updateDashboard();
        this.updateCharts();
        this.updateTable();
        this.updateReports();
    }

    clearFilters() {
        this.filters = {
            equipment: '',
            severity: '',
            status: '',
            period: 90,
            search: ''
        };

        document.getElementById('equipmentFilter').value = '';
        document.getElementById('severityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('periodFilter').value = '90';
        document.getElementById('searchInput').value = '';
        const mapFilter = document.getElementById('mapStatusFilter');
        if (mapFilter) mapFilter.value = 'abertas';

        this.applyFilters();
    }

    updateDashboard() {
        const total = this.filteredIncidents.length;
        const resolved = this.filteredIncidents.filter(inc => inc.status === 'Resolvido' || inc.status === 'Fechado').length;
        const active = this.filteredIncidents.filter(inc => inc.status !== 'Resolvido' && inc.status !== 'Fechado').length;

        // Calculate MTTR (Mean Time To Resolution)
        const resolvedIncidents = this.filteredIncidents.filter(inc => inc.resolutionDate);
        const avgMTTR = resolvedIncidents.length > 0 
            ? resolvedIncidents.reduce((sum, inc) => sum + inc.mttr, 0) / resolvedIncidents.length 
            : 0;

        // Calculate MTTD (Mean Time To Detection)
        const avgMTTD = this.filteredIncidents.length > 0 
            ? this.filteredIncidents.reduce((sum, inc) => sum + inc.mttd, 0) / this.filteredIncidents.length 
            : 0;

        document.getElementById('totalIncidents').textContent = total;
        document.getElementById('resolvedIncidents').textContent = resolved;
        document.getElementById('activeIncidents').textContent = active;
        document.getElementById('resolvedPercentage').textContent = total > 0 ? `${Math.round((resolved / total) * 100)}% do total` : '0% do total';
        document.getElementById('activePercentage').textContent = total > 0 ? `${Math.round((active / total) * 100)}% do total` : '0% do total';
        document.getElementById('averageMTTR').textContent = `${avgMTTR.toFixed(1)}h`;
        document.getElementById('averageMTTD').textContent = `${(avgMTTD * 60).toFixed(0)}min`;

        const summary = `Nos últimos ${this.filters.period} dias foram registradas ${total} ocorrências, ${resolved} resolvidas.`;
        document.getElementById('summaryText').textContent = summary;
    }

    createCharts() {
        this.createSeverityChart();
        this.createEquipmentChart();
        this.createMonthlyTrendChart();
        this.createMTTRChart();
        this.createLongTailChart();
        this.createAgencyMap();

        this.createSeverityChartReport();
        this.createEquipmentChartReport();
        this.createMonthlyTrendChartReport();
        this.createMTTRChartReport();
        this.createLongTailChartReport();
    }

    updateCharts() {
        if (this.charts.severity) this.updateSeverityChart();
        if (this.charts.equipment) this.updateEquipmentChart();
        if (this.charts.monthlyTrend) this.updateMonthlyTrendChart();
        if (this.charts.mttr) this.updateMTTRChart();
        if (this.charts.longTail) this.updateLongTailChart();
        if (this.maps.agency) this.updateAgencyMap();
        if (this.reportCharts.severity) this.updateSeverityChartReport();
        if (this.reportCharts.equipment) this.updateEquipmentChartReport();
        if (this.reportCharts.monthlyTrend) this.updateMonthlyTrendChartReport();
        if (this.reportCharts.mttr) this.updateMTTRChartReport();
        if (this.reportCharts.longTail) this.updateLongTailChartReport();
    }

    createSeverityChart() {
        const ctx = document.getElementById('severityChart').getContext('2d');
        const severityData = this.getSeverityData();

        this.charts.severity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: severityData.labels,
                datasets: [{
                    label: 'Incidentes',
                    data: severityData.data,
                    backgroundColor: severityData.colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateSeverityChart() {
        const severityData = this.getSeverityData();
        this.charts.severity.data.datasets[0].data = severityData.data;
        this.charts.severity.update();
    }

    getSeverityData() {
        const severityCounts = {};
        this.severidades.forEach(sev => {
            severityCounts[sev.nome] = this.filteredIncidents.filter(inc => inc.severity === sev.nome).length;
        });

        return {
            labels: this.severidades.map(sev => sev.nome),
            data: this.severidades.map(sev => severityCounts[sev.nome]),
            colors: this.severidades.map(sev => sev.cor)
        };
    }

    createEquipmentChart() {
        const ctx = document.getElementById('equipmentChart').getContext('2d');
        const equipmentData = this.getEquipmentData();

        this.charts.equipment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: equipmentData.labels,
                datasets: [{
                    label: 'Incidentes',
                    data: equipmentData.data,
                    backgroundColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    updateEquipmentChart() {
        const equipmentData = this.getEquipmentData();
        this.charts.equipment.data.datasets[0].data = equipmentData.data;
        this.charts.equipment.update();
    }

    getEquipmentData() {
        const equipmentCounts = {};
        this.equipamentos.forEach(eq => {
            equipmentCounts[eq.nome] = this.filteredIncidents.filter(inc => inc.equipment === eq.nome).length;
        });

        const sortedEquipment = this.equipamentos
            .map(eq => ({ name: eq.nome, count: equipmentCounts[eq.nome] }))
            .sort((a, b) => b.count - a.count);

        return {
            labels: sortedEquipment.map(eq => eq.name),
            data: sortedEquipment.map(eq => eq.count)
        };
    }

    createMonthlyTrendChart() {
        const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
        const monthlyData = this.getMonthlyData();

        this.charts.monthlyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Incidentes por Mês',
                    data: monthlyData.data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateMonthlyTrendChart() {
        const monthlyData = this.getMonthlyData();
        this.charts.monthlyTrend.data.datasets[0].data = monthlyData.data;
        this.charts.monthlyTrend.update();
    }

    getMonthlyData() {
        const now = new Date();
        const months = [];
        const monthlyCounts = [];

        for (let i = 2; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            months.push(monthName);

            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const count = this.filteredIncidents.filter(inc => 
                inc.startDate >= monthStart && inc.startDate <= monthEnd
            ).length;

            monthlyCounts.push(count);
        }

        return {
            labels: months,
            data: monthlyCounts
        };
    }

    createMTTRChart() {
        const ctx = document.getElementById('mttrChart').getContext('2d');
        const mttrData = this.getMTTRData();

        this.charts.mttr = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mttrData.labels,
                datasets: [{
                    label: 'MTTR Médio (horas)',
                    data: mttrData.data,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    updateMTTRChart() {
        const mttrData = this.getMTTRData();
        this.charts.mttr.data.datasets[0].data = mttrData.data;
        this.charts.mttr.update();
    }

    getMTTRData() {
        const now = new Date();
        const months = [];
        const mttrValues = [];

        for (let i = 2; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            months.push(monthName);

            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthIncidents = this.filteredIncidents.filter(inc => 
                inc.startDate >= monthStart && inc.startDate <= monthEnd && inc.resolutionDate
            );

            const avgMTTR = monthIncidents.length > 0 
                ? monthIncidents.reduce((sum, inc) => sum + inc.mttr, 0) / monthIncidents.length 
                : 0;

            mttrValues.push(parseFloat(avgMTTR.toFixed(1)));
        }

        return {
            labels: months,
            data: mttrValues
        };
    }

    getLongTailData(view) {
        const bins = ['<1d', '1-2d', '2-3d', '3-5d', '5-7d', '7-14d', '14+d'];
        const counts = Array(bins.length).fill(0);
        const now = new Date();
        const dataset = this.filteredIncidents.filter(inc => {
            const closed = inc.status === 'Resolvido' || inc.status === 'Fechado';
            return view === 'fechadas' ? closed : !closed;
        });

        dataset.forEach(inc => {
            const endDate = inc.resolutionDate ? inc.resolutionDate : now;
            const days = (endDate - inc.startDate) / (1000 * 60 * 60 * 24);
            let idx = 6;
            if (days < 1) idx = 0;
            else if (days < 2) idx = 1;
            else if (days < 3) idx = 2;
            else if (days < 5) idx = 3;
            else if (days < 7) idx = 4;
            else if (days < 14) idx = 5;
            counts[idx]++;
        });

        return { labels: bins, data: counts };
    }

    createLongTailChart() {
        const ctx = document.getElementById('longTailChart').getContext('2d');
        const filter = document.getElementById('longTailStatusFilter').value;
        const data = this.getLongTailData(filter);

        this.charts.longTail = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Ocorrências',
                    data: data.data,
                    backgroundColor: '#A855F7',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }

    updateLongTailChart() {
        const filter = document.getElementById('longTailStatusFilter').value;
        const data = this.getLongTailData(filter);
        this.charts.longTail.data.datasets[0].data = data.data;
        this.charts.longTail.update();
    }

    createSeverityChartReport() {
        const ctx = document.getElementById('severityChartReport').getContext('2d');
        const severityData = this.getSeverityData();
        this.reportCharts.severity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: severityData.labels,
                datasets: [{
                    label: 'Incidentes',
                    data: severityData.data,
                    backgroundColor: severityData.colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    updateSeverityChartReport() {
        const data = this.getSeverityData();
        this.reportCharts.severity.data.datasets[0].data = data.data;
        this.reportCharts.severity.update();
    }

    createEquipmentChartReport() {
        const ctx = document.getElementById('equipmentChartReport').getContext('2d');
        const equipmentData = this.getEquipmentData();
        this.reportCharts.equipment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: equipmentData.labels,
                datasets: [{
                    label: 'Incidentes',
                    data: equipmentData.data,
                    backgroundColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { ticks: { maxRotation: 45 } }
                }
            }
        });
    }

    updateEquipmentChartReport() {
        const data = this.getEquipmentData();
        this.reportCharts.equipment.data.datasets[0].data = data.data;
        this.reportCharts.equipment.update();
    }

    createMonthlyTrendChartReport() {
        const ctx = document.getElementById('monthlyTrendChartReport').getContext('2d');
        const monthlyData = this.getMonthlyData();
        this.reportCharts.monthlyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Incidentes por Mês',
                    data: monthlyData.data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    updateMonthlyTrendChartReport() {
        const data = this.getMonthlyData();
        this.reportCharts.monthlyTrend.data.datasets[0].data = data.data;
        this.reportCharts.monthlyTrend.update();
    }

    createMTTRChartReport() {
        const ctx = document.getElementById('mttrChartReport').getContext('2d');
        const mttrData = this.getMTTRData();
        this.reportCharts.mttr = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mttrData.labels,
                datasets: [{
                    label: 'MTTR Médio (horas)',
                    data: mttrData.data,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => value + 'h' }
                    }
                }
            }
        });
    }

    updateMTTRChartReport() {
        const data = this.getMTTRData();
        this.reportCharts.mttr.data.datasets[0].data = data.data;
        this.reportCharts.mttr.update();
    }

    createLongTailChartReport() {
        const ctx = document.getElementById('longTailChartReport').getContext('2d');
        const filter = document.getElementById('longTailStatusFilterReport').value;
        const data = this.getLongTailData(filter);
        this.reportCharts.longTail = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Ocorrências',
                    data: data.data,
                    backgroundColor: '#A855F7',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    updateLongTailChartReport() {
        const filter = document.getElementById('longTailStatusFilterReport').value;
        const data = this.getLongTailData(filter);
        this.reportCharts.longTail.data.datasets[0].data = data.data;
        this.reportCharts.longTail.update();
    }

    createAgencyMap() {
        const map = L.map('agencyMap').setView([-15.78, -47.93], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        this.maps.agency = map;
        this.updateAgencyMap();
    }

    getAgencyHeatData(view) {
        const counts = {};
        const dataset = this.filteredIncidents.filter(inc => {
            const closed = inc.status === 'Resolvido' || inc.status === 'Fechado';
            return view === 'abertas' ? !closed : true;
        });

        dataset.forEach(inc => {
            const coords = this.agenciaCoords[inc.agency];
            if (coords) {
                const key = coords.join(',');
                counts[key] = (counts[key] || 0) + 1;
            }
        });

        return Object.entries(counts).map(([k, c]) => {
            const [lat, lng] = k.split(',').map(Number);
            return [lat, lng, c];
        });
    }

    updateAgencyMap() {
        const filter = document.getElementById('mapStatusFilter').value;
        const heatData = this.getAgencyHeatData(filter);
        if (this.heatLayer) {
            this.heatLayer.setLatLngs(heatData);
        } else if (this.maps.agency) {
            this.heatLayer = L.heatLayer(heatData, { radius: 25 }).addTo(this.maps.agency);
        }
    }

    updateReports() {
        if (this.maps.agency) this.updateAgencyMap();
        const agencies = new Set(this.filteredIncidents.map(inc => inc.agency));
        const openAgencies = new Set(
            this.filteredIncidents
                .filter(inc => inc.status !== 'Resolvido' && inc.status !== 'Fechado')
                .map(inc => inc.agency)
        );
        const text = `Monitorando ${agencies.size} agências, ${openAgencies.size} com ocorrências em aberto.`;
        const el = document.getElementById('reportsNarrative');
        if (el) el.textContent = text;
    }

    updateTable() {
        const tableBody = document.getElementById('incidentsTableBody');
        tableBody.innerHTML = '';

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageIncidents = this.filteredIncidents.slice(startIndex, endIndex);

        pageIncidents.forEach(incident => {
            const row = document.createElement('tr');
            
            // Normalize severity and status for CSS classes
            const severityClass = incident.severity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const statusClass = incident.status.toLowerCase().replace(/\s+/g, '-');
            
            row.innerHTML = `
                <td><strong>${incident.id}</strong></td>
                <td>
                    <span class="equipment-icon">${incident.equipmentIcon}</span>
                    ${incident.equipment}
                </td>
                <td>${incident.agency}</td>
                <td>
                    <span class="severity-badge severity-${severityClass}">${incident.severity}</span>
                </td>
                <td>
                    <span class="status-badge status-${statusClass}">${incident.status}</span>
                </td>
                <td>${incident.startDate.toLocaleDateString('pt-BR')} ${incident.startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${this.getElapsedTime(incident)}</td>
                <td>${incident.responsible}</td>
                <td>
                    <button class="btn-view" data-incident-id="${incident.id}">
                        Ver Detalhes
                    </button>
                    <button class="btn-communicate" data-incident-id="${incident.id}">
                        💬 Comunicar Fornecedor
                    </button>
                </td>
            `;
            
            // Add event listeners to the buttons
            const viewBtn = row.querySelector('.btn-view');
            const commBtn = row.querySelector('.btn-communicate');
            
            viewBtn.addEventListener('click', () => this.showIncidentDetail(incident.id));
            commBtn.addEventListener('click', () => this.openSupplierCommunication(incident.id));
            
            tableBody.appendChild(row);
        });

        this.updatePagination();
    }

    getElapsedTime(incident) {
        const endTime = incident.resolutionDate || new Date();
        const elapsedMs = endTime - incident.startDate;
        const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
        const elapsedDays = Math.floor(elapsedHours / 24);
        const remainingHours = elapsedHours % 24;

        if (elapsedDays > 0) {
            return `${elapsedDays}d ${remainingHours}h`;
        } else {
            return `${elapsedHours}h`;
        }
    }

    updatePagination() {
        const totalItems = this.filteredIncidents.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const endItem = Math.min(startItem + this.itemsPerPage - 1, totalItems);

        document.getElementById('paginationInfo').textContent = 
            `Mostrando ${startItem} a ${endItem} de ${totalItems} incidentes`;

        // Update page numbers
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.innerHTML = '';

        if (totalPages > 1) {
            const maxVisiblePages = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = i;
                pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.updateTable();
                });
                pageNumbers.appendChild(pageBtn);
            }
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (this.currentPage === 1 || totalPages === 0) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }
        
        if (this.currentPage === totalPages || totalPages === 0) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    }

    showIncidentDetail(incidentId) {
        const incident = this.incidents.find(inc => inc.id === incidentId);
        if (!incident) return;

        this.currentIncidentId = incidentId;

        const statusClass = incident.status.toLowerCase().replace(/\s+/g, '-');
        const severityClass = incident.severity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">ID do Incidente:</span>
                <span class="detail-value"><strong>${incident.id}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Equipamento:</span>
                <span class="detail-value">${incident.equipmentIcon} ${incident.equipment}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fornecedor:</span>
                <span class="detail-value">${incident.supplier}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Agência:</span>
                <span class="detail-value">${incident.agency}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Severidade:</span>
                <span class="detail-value">
                    <span class="severity-badge severity-${severityClass}">${incident.severity}</span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <span class="status-badge status-${statusClass}">${incident.status}</span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data de Início:</span>
                <span class="detail-value">${incident.startDate.toLocaleDateString('pt-BR')} às ${incident.startDate.toLocaleTimeString('pt-BR')}</span>
            </div>
            ${incident.resolutionDate ? `
            <div class="detail-row">
                <span class="detail-label">Data de Resolução:</span>
                <span class="detail-value">${incident.resolutionDate.toLocaleDateString('pt-BR')} às ${incident.resolutionDate.toLocaleTimeString('pt-BR')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tempo de Resolução:</span>
                <span class="detail-value">${incident.mttr.toFixed(1)} horas</span>
            </div>
            ` : `
            <div class="detail-row">
                <span class="detail-label">Tempo Decorrido:</span>
                <span class="detail-value">${this.getElapsedTime(incident)}</span>
            </div>
            `}
            <div class="detail-row">
                <span class="detail-label">Responsável:</span>
                <span class="detail-value">${incident.responsible}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Descrição:</span>
                <span class="detail-value">${incident.description}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tempo de Detecção:</span>
                <span class="detail-value">${(incident.mttd * 60).toFixed(0)} minutos</span>
            </div>
        `;

        this.renderTimeline(incidentId);

        // Reset to details tab
        this.switchTab('details');
        document.getElementById('incidentModal').classList.remove('hidden');
    }

    openSupplierCommunication(incidentId) {
        const incident = this.incidents.find(inc => inc.id === incidentId);
        if (!incident) return;

        this.currentIncidentId = incidentId;
        
        // Fill supplier modal data
        document.getElementById('supplierName').textContent = incident.supplier;
        document.getElementById('incidentRef').textContent = `${incident.id} - ${incident.equipment}`;
        
        // Clear form
        document.getElementById('communicationTemplate').value = '';
        document.getElementById('communicationSubject').value = '';
        document.getElementById('communicationMessage').value = '';
        document.getElementById('communicationPriority').value = 'media';
        document.getElementById('includeAttachments').checked = false;
        
        // Set default deadline (24 hours from now)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('communicationDeadline').value = tomorrow.toISOString().slice(0, 16);

        document.getElementById('supplierModal').classList.remove('hidden');
    }

    openSupplierModal() {
        if (!this.currentIncidentId) return;
        this.openSupplierCommunication(this.currentIncidentId);
    }

    fillTemplate(templateKey) {
        const templates = {
            'urgencia': {
                subject: 'Verificação Urgente Necessária',
                message: 'Favor verificar funcionamento do equipamento com urgência devido à criticidade do problema reportado.'
            },
            'manutencao': {
                subject: 'Solicitação de Manutenção Preventiva',
                message: 'Solicitamos manutenção preventiva do equipamento conforme cronograma estabelecido.'
            },
            'falhas': {
                subject: 'Relatório de Falhas Intermitentes',
                message: 'Equipamento apresentando falhas intermitentes. Favor investigar e providenciar solução.'
            },
            'substituicao': {
                subject: 'Substituição de Componente',
                message: 'Necessária substituição de componente defeituoso identificado durante análise técnica.'
            },
            'atualizacao': {
                subject: 'Atualização de Software/Firmware',
                message: 'Favor atualizar software/firmware do equipamento para versão mais recente.'
            }
        };

        const template = templates[templateKey];
        if (template) {
            document.getElementById('communicationSubject').value = template.subject;
            document.getElementById('communicationMessage').value = template.message;
        }
    }

    loadComments() {
        const commentsList = document.getElementById('commentsList');
        const comments = this.comments[this.currentIncidentId] || [];

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <div class="empty-state-message">Nenhum comentário encontrado</div>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-meta">
                        <strong>${comment.author}</strong> • ${comment.timestamp.toLocaleDateString('pt-BR')} ${comment.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span class="comment-type comment-type--${comment.type}">
                        ${comment.type === 'interno' ? 'Interno' : comment.type === 'fornecedor' ? 'Para Fornecedor' : 'Técnico'}
                    </span>
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');
    }

    loadCommunications() {
        const communicationsList = document.getElementById('communicationsList');
        const communications = this.communications[this.currentIncidentId] || [];

        if (communications.length === 0) {
            communicationsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📤</div>
                    <div class="empty-state-message">Nenhuma comunicação encontrada</div>
                </div>
            `;
            return;
        }

        communicationsList.innerHTML = communications.map(comm => `
            <div class="communication-item">
                <div class="communication-header">
                    <h5 class="communication-title">${comm.subject}</h5>
                    <span class="communication-status communication-status--${comm.status}">
                        ${comm.status === 'enviado' ? 'Enviado' : comm.status === 'lido' ? 'Lido' : 'Respondido'}
                    </span>
                </div>
                <div class="communication-meta">
                    <strong>Para:</strong> ${comm.supplier} •
                    <strong>Prioridade:</strong> ${comm.priority.charAt(0).toUpperCase() + comm.priority.slice(1)} •
                    ${comm.timestamp.toLocaleDateString('pt-BR')} ${comm.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div class="communication-text">${comm.message}</div>
            </div>
        `).join('');
    }

    renderTimeline(incidentId) {
        const container = document.getElementById('timelineContainer');
        if (!container) return;
        const incident = this.incidents.find(inc => inc.id === incidentId);
        if (!incident) return;

        const events = [];
        events.push({ time: incident.startDate, text: 'Incidente aberto' });
        (this.comments[incidentId] || []).forEach(c => {
            events.push({ time: c.timestamp, text: `Comentário: ${c.text}` });
        });
        (this.communications[incidentId] || []).forEach(c => {
            events.push({ time: c.timestamp, text: `Comunicação: ${c.subject}` });
        });
        if (incident.resolutionDate) {
            events.push({ time: incident.resolutionDate, text: 'Incidente resolvido' });
        }

        events.sort((a, b) => a.time - b.time);

        container.innerHTML = events.map(ev => `
            <div class="timeline-item">
                <div class="timeline-date">${ev.time.toLocaleDateString('pt-BR')} ${ev.time.toLocaleTimeString('pt-BR')}</div>
                <div class="timeline-text">${ev.text}</div>
            </div>
        `).join('');
    }

    saveComment() {
        const type = document.getElementById('commentType').value;
        const text = document.getElementById('commentText').value.trim();

        if (!text) {
            this.showToast('Por favor, digite um comentário', 'warning');
            return;
        }

        const comment = {
            id: `COMM-${Date.now()}-${Math.random()}`,
            type: type,
            text: text,
            author: this.usuarios[0], // Assuming current user is first in list
            timestamp: new Date()
        };

        if (!this.comments[this.currentIncidentId]) {
            this.comments[this.currentIncidentId] = [];
        }

        this.comments[this.currentIncidentId].push(comment);
        
        // Clear form
        document.getElementById('commentText').value = '';
        
        // Reload comments
        this.loadComments();
        
        this.showToast('Comentário salvo com sucesso!', 'success');
    }

    sendCommentToSupplier() {
        const type = document.getElementById('commentType').value;
        const text = document.getElementById('commentText').value.trim();

        if (!text) {
            this.showToast('Por favor, digite um comentário', 'warning');
            return;
        }

        // Save as comment first
        this.saveComment();

        // Then open supplier modal with the comment as base
        document.getElementById('communicationSubject').value = 'Comentário sobre Incidente';
        document.getElementById('communicationMessage').value = text;
        document.getElementById('communicationPriority').value = type === 'interno' ? 'baixa' : 'media';
        
        document.getElementById('incidentModal').classList.add('hidden');
        this.openSupplierModal();
    }

    sendCommunication() {
        const subject = document.getElementById('communicationSubject').value.trim();
        const message = document.getElementById('communicationMessage').value.trim();
        const priority = document.getElementById('communicationPriority').value;
        const deadline = document.getElementById('communicationDeadline').value;
        const includeAttachments = document.getElementById('includeAttachments').checked;

        if (!subject || !message) {
            this.showToast('Por favor, preencha o assunto e a mensagem', 'warning');
            return;
        }

        const incident = this.incidents.find(inc => inc.id === this.currentIncidentId);
        if (!incident) return;

        // Simulate sending with loading state
        const sendButton = document.getElementById('sendCommunication');
        sendButton.classList.add('loading');
        sendButton.textContent = 'Enviando...';

        setTimeout(() => {
            const communication = {
                id: `COMM-${Date.now()}-${Math.random()}`,
                subject: subject,
                message: message,
                priority: priority,
                status: 'enviado',
                timestamp: new Date(),
                supplier: incident.supplier,
                deadline: deadline ? new Date(deadline) : null,
                hasAttachments: includeAttachments
            };

            if (!this.communications[this.currentIncidentId]) {
                this.communications[this.currentIncidentId] = [];
            }

            this.communications[this.currentIncidentId].push(communication);

            // Reset button
            sendButton.classList.remove('loading');
            sendButton.textContent = '📤 Enviar para Fornecedor';

            // Close modal and show success
            document.getElementById('supplierModal').classList.add('hidden');
            this.showToast('Comunicação enviada com sucesso para o fornecedor!', 'success');

            // If incident modal is open, refresh communications tab
            if (!document.getElementById('incidentModal').classList.contains('hidden')) {
                this.loadCommunications();
            }
        }, 2000);
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    removeToast(toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    setupThemeToggle() {
        const body = document.body;
        const saved = localStorage.getItem('theme');
        if (saved) {
            body.dataset.colorScheme = saved;
        }
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const next = body.dataset.colorScheme === 'dark' ? 'light' : 'dark';
                body.dataset.colorScheme = next;
                localStorage.setItem('theme', next);
            });
        }
    }

    exportData() {
        const btn = document.getElementById('exportBtn');
        if (btn) {
            btn.classList.add('loading');
            btn.textContent = 'Exportando...';
        }

        setTimeout(() => {
            const csvContent = this.generateCSV();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `incidentes_itau_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (btn) {
                btn.classList.remove('loading');
                btn.textContent = 'Exportar Relatório';
            }
        }, 500);
    }

    generateCSV() {
        const headers = ['ID', 'Equipamento', 'Fornecedor', 'Agência', 'Severidade', 'Status', 'Data Início', 'Data Resolução', 'Responsável', 'Descrição'];
        const rows = this.filteredIncidents.map(incident => [
            incident.id,
            incident.equipment,
            incident.supplier,
            incident.agency,
            incident.severity,
            incident.status,
            incident.startDate.toLocaleDateString('pt-BR') + ' ' + incident.startDate.toLocaleTimeString('pt-BR'),
            incident.resolutionDate ? incident.resolutionDate.toLocaleDateString('pt-BR') + ' ' + incident.resolutionDate.toLocaleTimeString('pt-BR') : '',
            incident.responsible,
            incident.description
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return '\ufeff' + csvContent; // Add BOM for Excel compatibility
    }
}

// Initialize the application
window.app = new IBSApp();