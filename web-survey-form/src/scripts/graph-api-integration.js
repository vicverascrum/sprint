class GraphAPIIntegration {
    constructor() {
        this.clientId = 'your-azure-app-client-id';
        this.tenantId = 'your-tenant-id';
        this.siteId = 'your-sharepoint-site-id';
        this.driveId = 'your-drive-id';
        this.fileId = 'your-excel-file-id';
    }

    async authenticate() {
        // Usar MSAL.js para autenticación
        const msalConfig = {
            auth: {
                clientId: this.clientId,
                authority: `https://login.microsoftonline.com/${this.tenantId}`
            }
        };

        const msalInstance = new msal.PublicClientApplication(msalConfig);
        
        const loginRequest = {
            scopes: ["https://graph.microsoft.com/Files.ReadWrite"]
        };

        try {
            const response = await msalInstance.loginPopup(loginRequest);
            return response.accessToken;
        } catch (error) {
            console.error('Authentication failed:', error);
            return null;
        }
    }

    async addRowToExcel(formData, accessToken) {
        const url = `https://graph.microsoft.com/v1.0/sites/${this.siteId}/drives/${this.driveId}/items/${this.fileId}/workbook/worksheets/Sheet1/tables/Table1/rows/add`;
        
        const rowData = {
            values: [[
                formData.email,
                new Date().toISOString(),
                JSON.stringify(formData.responses),
                formData.prioritySummary.high,
                formData.prioritySummary.medium,
                formData.prioritySummary.low
            ]]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rowData)
            });

            return response.ok;
        } catch (error) {
            console.error('Error adding row to Excel:', error);
            return false;
        }
    }
}
