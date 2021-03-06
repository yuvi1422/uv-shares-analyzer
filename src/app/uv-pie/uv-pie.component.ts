import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';

import uvDevice from '@uv-tech/util/modules/uv-device';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_material from '@amcharts/amcharts4/themes/material';

import * as appData from './../uv-data.json';

import { Category } from './../category';
import { UvDashboardService } from './../dashboard/uv-dashboard.service';

@Component({
  selector: 'app-uv-pie',
  templateUrl: './uv-pie.component.html',
  styleUrls: ['./uv-pie.component.scss']
})
export class UvPieComponent implements OnInit, AfterViewInit {

  private chart: am4charts.PieChart3D;
  constructor(private zone: NgZone,
              private uvDashboardService: UvDashboardService) { }

  ngOnInit(): void {
    am4core.useTheme(am4themes_material);
    am4core.useTheme(am4themes_animated);
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {

      const chart = am4core.create('pieDiv', am4charts.PieChart3D);

      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

      chart.data = this.getProcessedData(appData.categories);

      const series = chart.series.push(new am4charts.PieSeries3D());

      series.dataFields.value = 'value';
      series.dataFields.category = 'name';
      series.slices.template.propertyFields.fill = 'color';
      series.slices.template.propertyFields.isActive = 'isActive';
      series.slices.template.propertyFields.id = 'id';

      series.slices.template.events.on('hit', ((ev) => {
        this.uvDashboardService.updateSector(Number(ev.target.id));
        series.slices.each(((item) => {
          if (item.isActive && item !== ev.target) {
            item.isActive = false;
          }
        }));
      }));

      if (uvDevice.isMobileDevice()) {
        chart.legend = new am4charts.Legend();
        series.labels.template.disabled = true;
      }
      series.labels.template.wrap = true;
      series.labels.template.width = 150;
    });
  }

  getSectorTotal(category: Category): number {
    let total = 0;
    for (const item of category.items) {
      total += item.price * item.quantity;
    }
    return total;
  }

  getProcessedData(sectors): any[] {
    const processedSectors = [];
    for (const sector of sectors) {
      sector.value = this.getSectorTotal(sector);
      if (sector.value > 0) {
        processedSectors.push(sector);
      }
    }
    return processedSectors;
  }
}
