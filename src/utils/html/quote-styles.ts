
// Estilos CSS para o documento de cotação
export const quoteStyles = `
  /* Estilos gerais */
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }
  
  h1, h2, h3 {
    color: #FF6600; /* Cor principal HostDime */
    margin: 10px 0;
  }
  
  .container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  
  .header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .header img {
    max-width: 250px;
    margin: 0 auto 15px;
    display: block;
  }
  
  .quote-info {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin: 20px 0;
  }
  
  .quote-info-item {
    flex: 1;
    min-width: 200px;
    margin-bottom: 15px;
  }
  
  .quote-info-label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #FF6600;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  
  .table th, .table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .table th {
    background-color: #FF6600;
    color: #fff;
  }
  
  .table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .table tr:hover {
    background-color: #f5f5f5;
  }
  
  .total-section {
    margin: 30px 0;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #FF6600;
  }
  
  .total {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 0;
  }
  
  .footer {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    color: #666;
    font-size: 14px;
  }
  
  .observations {
    margin: 20px 0;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  /* Responsividade */
  @media (max-width: 768px) {
    .container {
      padding: 15px;
    }
    
    .table th, .table td {
      padding: 8px;
      font-size: 14px;
    }
    
    .total {
      font-size: 18px;
    }
    
    .quote-info-item {
      flex: 0 0 100%;
    }
  }
`;
