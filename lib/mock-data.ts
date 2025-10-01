// Umfangreiche Mock-Daten für kontoradar.zvv.dev - ÖV-spezifische Daten
import { OKOverview, AccountOverview, Booking } from './types'

// Generiere umfangreiche historische Daten 2024-2025 mit maximaler Diversität
const generateHistoricalData = () => {
  const accounts = [
    // IT & Digitalisierung
    { id: '1', nr: '3911000000', name: 'Vergütung Informatikdienstleistungen' },
    { id: '2', nr: '3912000000', name: 'Vergütung Beratungsdienstleistungen' },
    { id: '3', nr: '3913000000', name: 'Vergütung Wartungsdienstleistungen' },
    { id: '4', nr: '3914000000', name: 'Cloud-Services und Hosting' },
    { id: '5', nr: '3915000000', name: 'Cybersecurity und Datenschutz' },
    { id: '6', nr: '3916000000', name: 'KI und Machine Learning Services' },
    
    // Infrastruktur & Wartung
    { id: '7', nr: '3921000000', name: 'Fahrzeugwartung und -reparatur' },
    { id: '8', nr: '3922000000', name: 'Infrastrukturwartung' },
    { id: '9', nr: '3923000000', name: 'Signal- und Sicherungstechnik' },
    { id: '10', nr: '3924000000', name: 'Gleisanlagen und Weichen' },
    { id: '11', nr: '3925000000', name: 'Bahnhofsmodernisierung' },
    { id: '12', nr: '3926000000', name: 'Elektrische Anlagen' },
    { id: '13', nr: '3927000000', name: 'Klima- und Lüftungstechnik' },
    { id: '14', nr: '3928000000', name: 'Rollmaterial-Instandhaltung' },
    
    // Verkehr & Logistik
    { id: '15', nr: '3931000000', name: 'Personenverkehrsleistungen' },
    { id: '16', nr: '3932000000', name: 'Güterverkehrsleistungen' },
    { id: '17', nr: '3933000000', name: 'Mobilitätsdienstleistungen' },
    { id: '18', nr: '3934000000', name: 'Park & Ride Anlagen' },
    { id: '19', nr: '3935000000', name: 'Bike & Ride Services' },
    { id: '20', nr: '3936000000', name: 'On-Demand Verkehr' },
    
    // Energie & Umwelt
    { id: '21', nr: '3941000000', name: 'Energieversorgung' },
    { id: '22', nr: '3942000000', name: 'Telekommunikation' },
    { id: '23', nr: '3943000000', name: 'Erneuerbare Energien' },
    { id: '24', nr: '3944000000', name: 'Energieeffizienz-Maßnahmen' },
    { id: '25', nr: '3945000000', name: 'Klimaschutz-Projekte' },
    { id: '26', nr: '3946000000', name: 'Nachhaltigkeitsinitiativen' },
    
    // Services & Support
    { id: '27', nr: '3951000000', name: 'Sicherheitsdienstleistungen' },
    { id: '28', nr: '3952000000', name: 'Reinigungsdienstleistungen' },
    { id: '29', nr: '3953000000', name: 'Kundenservice und Support' },
    { id: '30', nr: '3954000000', name: 'Facility Management' },
    { id: '31', nr: '3955000000', name: 'Catering und Gastronomie' },
    { id: '32', nr: '3956000000', name: 'Wartung und Instandhaltung' },
    
    // Marketing & Kommunikation
    { id: '33', nr: '3961000000', name: 'Marketing und Werbung' },
    { id: '34', nr: '3962000000', name: 'Öffentlichkeitsarbeit' },
    { id: '35', nr: '3963000000', name: 'Digitale Kommunikation' },
    { id: '36', nr: '3964000000', name: 'Social Media Management' },
    { id: '37', nr: '3965000000', name: 'Event Management' },
    { id: '38', nr: '3966000000', name: 'Kundenbindungsprogramme' },
    
    // Bildung & Forschung
    { id: '39', nr: '3971000000', name: 'Aus- und Weiterbildung' },
    { id: '40', nr: '3972000000', name: 'Forschung und Entwicklung' },
    { id: '41', nr: '3973000000', name: 'Innovationsprojekte' },
    { id: '42', nr: '3974000000', name: 'Pilotprojekte' },
    { id: '43', nr: '3975000000', name: 'Technologie-Transfer' },
    { id: '44', nr: '3976000000', name: 'Studien und Analysen' },
    
    // Recht & Finanzen
    { id: '45', nr: '3981000000', name: 'Rechtsberatung' },
    { id: '46', nr: '3982000000', name: 'Steuerberatung' },
    { id: '47', nr: '3983000000', name: 'Compliance und Governance' },
    { id: '48', nr: '3984000000', name: 'Risikomanagement' },
    { id: '49', nr: '3985000000', name: 'Audit und Prüfung' },
    { id: '50', nr: '3986000000', name: 'Projektmanagement' },
    
    // Versicherung & Finanzen
    { id: '51', nr: '3991000000', name: 'Versicherungen' },
    { id: '52', nr: '3992000000', name: 'Finanzdienstleistungen' },
    { id: '53', nr: '3993000000', name: 'Investitionen und Beteiligungen' },
    { id: '54', nr: '3994000000', name: 'Kreditwesen' },
    { id: '55', nr: '3995000000', name: 'Treasury Management' },
    { id: '56', nr: '3996000000', name: 'Controlling und Reporting' }
  ]

  const okTemplates = [
    // IT & Digitalisierung
    { prefix: 'IT', names: ['Digitalisierungsprojekt', 'Systemmodernisierung', 'Datenmigration', 'Cloud-Migration', 'Cybersecurity', 'App-Entwicklung', 'Website-Relaunch', 'ERP-System', 'BI-Dashboard', 'API-Entwicklung', 'KI-Integration', 'Blockchain-Pilot', 'IoT-Plattform', 'Mobile-First', 'Microservices', 'DevOps-Pipeline', 'Data-Lake', 'Machine-Learning', 'Chatbot-Entwicklung', 'AR/VR-Experience'] },
    
    // Fahrzeug & Technik
    { prefix: 'FV', names: ['Fahrzeugwartung', 'Tram-Modernisierung', 'Bus-Ersatzbeschaffung', 'Zug-Reparatur', 'Technik-Upgrade', 'Sicherheitssystem', 'Kommunikationssystem', 'Antriebsmodernisierung', 'Klimaanlage-Reparatur', 'Bremssystem-Service', 'Batterie-Technologie', 'Autonomes Fahren', 'Predictive Maintenance', 'Smart-Ticketing', 'Fahrgast-Info', 'Barrierefreiheit', 'WLAN-Ausstattung', 'Ladestationen', 'H2-Antrieb', 'E-Mobilität'] },
    
    // Infrastruktur
    { prefix: 'IN', names: ['Gleisbau', 'Haltestellen-Modernisierung', 'Tunnel-Sanierung', 'Brücken-Reparatur', 'Signal-Anlage', 'Weichen-Service', 'Oberleitung-Wartung', 'Bahnsteig-Erneuerung', 'Parkplatz-Ausbau', 'Fahrradabstellanlage', 'Hochgeschwindigkeitsstrecke', 'Elektrische Anlagen', 'Stromversorgung', 'Notfall-System', 'Überwachung', 'Zugangskontrolle', 'Grünflächen', 'Beleuchtung', 'Klimaanlage', 'Wartung'] },
    
    // Service & Betrieb
    { prefix: 'SB', names: ['Kundenservice', 'Fahrplan-Optimierung', 'Ticket-System', 'Informationssystem', 'Barrierefreiheit', 'Sicherheitsdienst', 'Reinigungsservice', 'Wartungsservice', 'Notfall-System', 'Qualitätsmanagement', 'Mobilitäts-App', 'On-Demand-Service', 'Bike-Sharing', 'E-Scooter', 'Park & Ride', 'Bike & Ride', 'Carsharing', 'Ridepooling', 'Mikromobilität', 'Intermodalität'] },
    
    // Marketing & Kommunikation
    { prefix: 'MK', names: ['Kampagne', 'Öffentlichkeitsarbeit', 'Social Media', 'Website-Content', 'Broschüren', 'Plakate', 'Events', 'Pressearbeit', 'Kundenbefragung', 'Marktforschung', 'Branding', 'Content-Marketing', 'Event-Marketing', 'PR-Arbeit', 'Kundenbindung', 'Loyalty-Programm', 'Influencer-Marketing', 'Viral-Marketing', 'Digital-Marketing', 'Performance-Marketing'] },
    
    // Ausbildung & Entwicklung
    { prefix: 'AE', names: ['Mitarbeiterschulung', 'Führungskräfte-Entwicklung', 'Sicherheitstraining', 'Technik-Schulung', 'Kundenservice-Training', 'Digitalisierung-Schulung', 'Sprachkurs', 'Führerschein-Ausbildung', 'Sicherheitsunterweisung', 'Qualifikation', 'E-Learning', 'Blended-Learning', 'Micro-Learning', 'Gamification', 'VR-Training', 'Simulation', 'Onboarding', 'Leadership-Development', 'Skills-Assessment', 'Mentoring'] },
    
    // Energie & Umwelt
    { prefix: 'EN', names: ['Solar-Anlage', 'Wind-Energie', 'Geothermie', 'Energieeffizienz', 'Klimaschutz', 'CO2-Reduktion', 'Nachhaltigkeit', 'Green-IT', 'E-Mobilität', 'Wasserkraft', 'Biogas', 'Wärmepumpen', 'LED-Beleuchtung', 'Smart-Grid', 'Energie-Speicher', 'Wärmerückgewinnung', 'Dämmung', 'Fassaden-Sanierung', 'Dach-Begrünung', 'Regenwasser'] },
    
    // Forschung & Innovation
    { prefix: 'FI', names: ['Pilotprojekt', 'Studie', 'Forschung', 'Innovation', 'Prototyp', 'Testphase', 'Evaluation', 'Analyse', 'Benchmarking', 'Best-Practice', 'Technologie-Transfer', 'Startup-Kooperation', 'Universitäts-Partnerschaft', 'Open-Innovation', 'Hackathon', 'Innovation-Lab', 'Future-Mobility', 'Smart-City', 'Digital-Twin', 'Sustainability'] },
    
    // Recht & Compliance
    { prefix: 'RC', names: ['Compliance', 'Audit', 'Prüfung', 'Governance', 'Risikomanagement', 'Datenschutz', 'DSGVO', 'IT-Sicherheit', 'Business-Continuity', 'Disaster-Recovery', 'Verschlüsselung', 'Zugriffskontrolle', 'Monitoring', 'Incident-Response', 'Penetration-Test', 'Vulnerability-Assessment', 'Security-Awareness', 'Policy-Management', 'Regulatory-Reporting', 'Internal-Audit'] },
    
    // Finanzen & Controlling
    { prefix: 'FC', names: ['Budget-Planung', 'Kostenkontrolle', 'Reporting', 'Analytics', 'Forecasting', 'Variance-Analysis', 'Profitability-Analysis', 'Cash-Flow', 'Working-Capital', 'Investment-Analysis', 'ROI-Optimization', 'Cost-Center', 'Activity-Based-Costing', 'Performance-Measurement', 'KPI-Dashboard', 'Financial-Modeling', 'Risk-Assessment', 'Treasury-Management', 'Tax-Optimization', 'M&A-Support'] }
  ]

  const oks: OKOverview[] = []
  const bookings: Booking[] = []
  
  let okId = 1
  let bookingId = 1

  // Generiere 50 OKs mit 2024 und 2025 Daten - übersichtliche Testdaten
  // Verwende nur 8 Konten damit jedes Konto 6-7 OKs hat (besser sichtbar)
  const activeAccounts = accounts.slice(0, 8)
  
  for (let i = 0; i < 50; i++) {
    const account = activeAccounts[i % activeAccounts.length]
    const template = okTemplates[i % okTemplates.length]
    const name = template.names[i % template.names.length]
    
    // Bestimme Jahr basierend auf Index (60% 2024, 40% 2025)
    const is2025 = i > 30
    const year = is2025 ? 2025 : 2024
    const yearPrefix = is2025 ? '25' : '24'
    const okNr = `${template.prefix}${yearPrefix}${String(i % 1000).padStart(3, '0')}`
    
    // Variiere Budget-Größen für mehr Realismus
    const budgetMultiplier = Math.random()
    let budgetTotal: number
    if (budgetMultiplier < 0.1) {
      budgetTotal = Math.floor(Math.random() * 50000) + 10000 // 10k-60k (kleine Projekte)
    } else if (budgetMultiplier < 0.3) {
      budgetTotal = Math.floor(Math.random() * 200000) + 50000 // 50k-250k (mittlere Projekte)
    } else if (budgetMultiplier < 0.7) {
      budgetTotal = Math.floor(Math.random() * 500000) + 100000 // 100k-600k (große Projekte)
    } else {
      budgetTotal = Math.floor(Math.random() * 2000000) + 500000 // 500k-2.5M (Mega-Projekte)
    }
    
    // Realistischere Verbrauchs-Patterns
    const progressFactor = Math.random()
    let spent: number
    if (progressFactor < 0.2) {
      spent = Math.floor(Math.random() * budgetTotal * 0.2) // 0-20% (neue Projekte)
    } else if (progressFactor < 0.5) {
      spent = Math.floor(Math.random() * budgetTotal * 0.5) + budgetTotal * 0.2 // 20-70% (laufende Projekte)
    } else if (progressFactor < 0.8) {
      spent = Math.floor(Math.random() * budgetTotal * 0.3) + budgetTotal * 0.7 // 70-100% (fast fertig)
    } else {
      spent = budgetTotal + Math.floor(Math.random() * budgetTotal * 0.1) // 100-110% (über Budget)
    }
    
    const available = budgetTotal - spent
    
    // Realistische Datumsverteilung
    let firstBooking: Date
    let lastBooking: Date
    
    if (is2025) {
      // 2025 Projekte: Januar bis Dezember
      const startMonth = Math.floor(Math.random() * 12) // 0-11
      const startDay = Math.floor(Math.random() * 28) + 1
      firstBooking = new Date(2025, startMonth, startDay)
      
      // Letzte Buchung: 1-6 Monate nach Start
      const endMonth = Math.min(11, startMonth + Math.floor(Math.random() * 6) + 1)
      const endDay = Math.floor(Math.random() * 28) + 1
      lastBooking = new Date(2025, endMonth, endDay)
    } else {
      // 2024 Projekte: Februar bis Dezember
      const startMonth = Math.floor(Math.random() * 10) + 1 // 1-10 (Feb-Nov)
      const startDay = Math.floor(Math.random() * 28) + 1
      firstBooking = new Date(2024, startMonth, startDay)
      
      // Letzte Buchung: bis Dezember 2024
      const endMonth = Math.min(11, startMonth + Math.floor(Math.random() * 8) + 1)
      const endDay = Math.floor(Math.random() * 28) + 1
      lastBooking = new Date(2024, endMonth, endDay)
    }
    
    // Generiere 2-8 Buchungen pro OK (durchschnittlich 4, gesamt ca. 200 Buchungen)
    const bookingCount = Math.floor(Math.random() * 7) + 2
    
    const ok: OKOverview = {
      ok_id: okId.toString(),
      ok_nr: okNr,
      title: name,
      budget_total: budgetTotal,
      spent: -spent,
      available: available,
      booking_count: bookingCount,
      first_booking: firstBooking.toISOString().split('T')[0],
      last_booking: lastBooking.toISOString().split('T')[0],
      account_id: account.id,
      konto_nr: account.nr,
      account_name: account.name
    }
    
    oks.push(ok)
    
    // Zeitspanne für Buchungsverteilung
    const timeSpan = lastBooking.getTime() - firstBooking.getTime()
    
    // Realistische Lieferanten
    const vendors = [
      'KANTON ZÜRICH', 'ABRAXAS AG', 'IBM SCHWEIZ AG', 'MICROSOFT SCHWEIZ GMBH', 
      'SAP SCHWEIZ AG', 'SWISSCOM AG', 'SIEMENS SCHWEIZ AG', 'ABB SCHWEIZ AG',
      'HUAWEI TECHNOLOGIES', 'CISCO SYSTEMS', 'ACCENTURE AG', 'DELOITTE AG',
      'PWC SCHWEIZ', 'KPMG AG', 'EY SCHWEIZ', 'BDO AG', 'STADLER RAIL AG',
      'BOMBARDIER TRANSPORTATION', 'ALSTOM SCHWEIZ AG', 'CAF SCHWEIZ',
      'GOOGLE SCHWEIZ GMBH', 'AMAZON WEB SERVICES', 'SALESFORCE.COM',
      'ORACLE SCHWEIZ GMBH', 'ADOBE SYSTEMS', 'AUTODESK SCHWEIZ'
    ]
    
    const phases = ['Konzeptphase', 'Design', 'Entwicklung', 'Testing', 'Deployment', 
                    'Wartung', 'Support', 'Schulung', 'Beratung', 'Infrastruktur',
                    'Hardware', 'Software', 'Lizenzen', 'Services', 'Integration']
    
    // Verteile den spent-Betrag realistisch über die Buchungen
    let remainingSpent = Math.abs(spent)
    const bookingAmounts: number[] = []
    
    for (let j = 0; j < bookingCount; j++) {
      let amount: number
      
      if (j === bookingCount - 1) {
        // Letzte Buchung: Rest-Betrag
        amount = Math.max(100, remainingSpent)
      } else {
        // Variiere Buchungsgrößen realistisch
        const sizeRoll = Math.random()
        if (sizeRoll < 0.3) {
          // 30%: Kleine Buchungen (5-15% des Durchschnitts)
          amount = Math.floor((remainingSpent / (bookingCount - j)) * (0.05 + Math.random() * 0.1))
        } else if (sizeRoll < 0.6) {
          // 30%: Mittlere Buchungen (50-150% des Durchschnitts)
          amount = Math.floor((remainingSpent / (bookingCount - j)) * (0.5 + Math.random()))
        } else {
          // 40%: Große Buchungen (100-300% des Durchschnitts)
          amount = Math.floor((remainingSpent / (bookingCount - j)) * (1 + Math.random() * 2))
        }
        
        // Mindestens 100 CHF, maximal der Rest
        amount = Math.min(Math.max(100, amount), remainingSpent - (bookingCount - j - 1) * 100)
      }
      
      bookingAmounts.push(amount)
      remainingSpent -= amount
    }
    
    // Erstelle Buchungen chronologisch sortiert
    const sortedBookingDates = []
    for (let j = 0; j < bookingCount; j++) {
      // Exponentieller Verlauf: mehr Buchungen am Anfang, weniger am Ende
      const progress = Math.pow(j / bookingCount, 0.7) // Exponent < 1 für mehr Aktivität am Anfang
      const randomTime = firstBooking.getTime() + (progress * timeSpan) + (Math.random() * timeSpan * 0.05)
      sortedBookingDates.push(new Date(randomTime))
    }
    sortedBookingDates.sort((a, b) => a.getTime() - b.getTime())
    
    for (let j = 0; j < bookingCount; j++) {
      const bookingDate = sortedBookingDates[j]
      const amount = bookingAmounts[j]
      const vendor = vendors[Math.floor(Math.random() * vendors.length)]
      const phase = phases[Math.floor(Math.random() * phases.length)]
      
      const booking: Booking = {
        id: bookingId,
        ok_id: okId.toString(),
        account_id: account.id,
        import_batch_id: null,
        booking_date: bookingDate.toISOString().split('T')[0],
        beleg_nr: `ZVV${String(130000 + bookingId).padStart(6, '0')}`,
        text_long: `${Math.floor(Math.random() * 3000) + 2000} ${vendor}, ${name} - ${phase}`,
        gegenkonto: '2005500100 K',
        amount: -amount,
        currency: 'CHF',
        created_at: bookingDate.toISOString(),
        updated_at: bookingDate.toISOString()
      }
      
      bookings.push(booking)
      bookingId++
    }
    
    okId++
  }
  
  // Sortiere OKs nach Konto-Nummer für bessere Übersichtlichkeit
  oks.sort((a, b) => {
    if (a.konto_nr !== b.konto_nr) {
      return a.konto_nr.localeCompare(b.konto_nr)
    }
    return a.ok_nr.localeCompare(b.ok_nr)
  })
  
  // Generiere Account-Übersichten
  const accountOverviews: AccountOverview[] = accounts.map(account => {
    const accountOKs = oks.filter(ok => ok.account_id === account.id)
    const totalBudget = accountOKs.reduce((sum, ok) => sum + ok.budget_total, 0)
    const totalSpent = accountOKs.reduce((sum, ok) => sum + Math.abs(ok.spent), 0)
    const totalAvailable = totalBudget - totalSpent
    
    return {
      account_id: account.id,
      konto_nr: account.nr,
      account_name: account.name,
      ok_count: accountOKs.length,
      total_budget: totalBudget,
      total_spent: totalSpent,
      total_available: totalAvailable
    }
  })

  return { oks, bookings, accounts: accountOverviews }
}

const { oks, bookings, accounts } = generateHistoricalData()

export const mockOKOverviews: OKOverview[] = oks
export const mockAccountOverviews: AccountOverview[] = accounts
export const mockBookings: Booking[] = bookings

// Mock-Supabase Client für lokale Entwicklung
export class MockSupabaseClient {
  from(table: string) {
    return {
      select: (columns: string = '*') => {
        // Return a chainable object that can handle various query methods
        const queryBuilder = {
          eq: (column: string, value: any) => ({
            single: () => this.getSingleRecord(table, column, value),
            order: (column: string, options: any) => this.getRecords(table),
            limit: (count: number) => this.getRecords(table),
            ilike: (column: string, pattern: string) => this.getRecords(table),
            gte: (column: string, value: any) => this.getRecords(table),
            lte: (column: string, value: any) => this.getRecords(table)
          }),
          order: (column: string, options: any) => this.getRecords(table),
          limit: (count: number) => this.getRecords(table),
          // Direct call without chaining
          then: (resolve: any, reject: any) => {
            this.getRecords(table).then(resolve).catch(reject)
          }
        }
        
        // Make it thenable for direct Promise usage
        return Object.assign(queryBuilder, {
          then: (resolve: any, reject: any) => {
            this.getRecords(table).then(resolve).catch(reject)
          }
        })
      }
    }
  }

  private getRecords(table: string) {
    console.log(`🔍 Mock: Loading data from table: ${table}`)
    const data = this.getTableData(table)
    console.log(`📊 Mock: Found ${data.length} records`)
    return Promise.resolve({
      data: data,
      error: null
    })
  }

  private getSingleRecord(table: string, column: string, value: any) {
    const data = this.getTableData(table)
    const record = data.find((item: any) => item[column] === value)
    return Promise.resolve({
      data: record || null,
      error: record ? null : { message: 'Record not found' }
    })
  }

  private getTableData(table: string) {
    switch (table) {
      case 'v_ok_overview':
        console.log(`📋 Mock: Returning ${mockOKOverviews.length} OK overviews`)
        return mockOKOverviews
      case 'v_account_overview':
        console.log(`📋 Mock: Returning ${mockAccountOverviews.length} account overviews`)
        return mockAccountOverviews
      case 'booking':
        console.log(`📋 Mock: Returning ${mockBookings.length} bookings`)
        return mockBookings
      default:
        console.log(`❌ Mock: Unknown table: ${table}`)
        return []
    }
  }
}

export const mockSupabase = new MockSupabaseClient()
