import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';

import { UvUtilService } from './../uv-util.service';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_material from '@amcharts/amcharts4/themes/material';

import * as pieData from './uv-pie.json';

am4core.useTheme(am4themes_material);
am4core.useTheme(am4themes_animated);

interface Sector {
  name: string;
  value: number;
  shares: any[];
}

@Component({
  selector: 'app-uv-pie',
  templateUrl: './uv-pie.component.html',
  styleUrls: ['./uv-pie.component.scss']
})
export class UvPieComponent implements OnInit, AfterViewInit {

  private chart: am4charts.PieChart3D;
  constructor(private zone: NgZone, private uvUtilService: UvUtilService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {

      const chart = am4core.create('pieDiv', am4charts.PieChart3D);

      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

      chart.data = this.getProcessedData(pieData.sectors);

      const series = chart.series.push(new am4charts.PieSeries3D());

      series.dataFields.value = 'value';
      series.dataFields.category = 'name';
      series.slices.template.propertyFields.fill = 'color';

      series.slices.template.events.on('hit', ((event) => {
        const tmpSeries = event.target.dataItem.component;
        tmpSeries.slices.each((item) => {
          if (item.isActive && item !== event.target) {
            item.isActive = false;
          }
        });
      }));

      if (this.uvUtilService.isMobileDevice()) {
        chart.legend = new am4charts.Legend();
        series.labels.template.disabled = true;
      }
    });
  }

  getSectorTotal(sector: Sector): number {
    let total = 0;
    for (const share of sector.shares) {
      total += share.price * share.quantity;
    }
    return total;
  }

  getProcessedData(sectors): any[] {
    for (const sector of sectors) {
      sector.value = this.getSectorTotal(sector);
    }
    return sectors;
  }
}