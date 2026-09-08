import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { MasterCrud } from './master-crud';

@Component({
  selector: 'app-masters-page',
  imports: [TabsModule, MasterCrud],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Masters</h1>
    <p class="text-surface-500 text-sm mb-4">Reference data used across cases. Deactivating keeps existing case references intact.</p>

    <p-tabs value="courts">
      <p-tablist>
        <p-tab value="courts">Courts</p-tab>
        <p-tab value="case-types">Case Types</p-tab>
        <p-tab value="case-stages">Case Stages</p-tab>
      </p-tablist>
      <p-tabpanels>
        <p-tabpanel value="courts"><app-master-crud resource="courts" title="Court" /></p-tabpanel>
        <p-tabpanel value="case-types"><app-master-crud resource="case-types" title="Case Type" /></p-tabpanel>
        <p-tabpanel value="case-stages"><app-master-crud resource="case-stages" title="Case Stage" /></p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  `,
})
export class MastersPage {}
