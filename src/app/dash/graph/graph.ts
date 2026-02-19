import { Component, ViewChild } from '@angular/core';
import { NgApexchartsModule } from "ng-apexcharts";


import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ChartComponent
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
};

@Component({
  selector: 'graph',
  imports: [NgApexchartsModule],
  templateUrl: './graph.html',
  styleUrl: './graph.css',
})
export class Graph {

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {

    const consumedKcal = 707;
    const totalKcal = 1428;
    const percentage = (consumedKcal / totalKcal) * 100;
    
    this.chartOptions = {
      series: [707],
      chart: {
        type: "radialBar",
        height: 300,
        offsetY: 0
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: {
            size: '50%',
          },
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5,
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: 0,
              fontSize: "22px",
              color: "#000",
              formatter: function (val: number) {
                return val + " kcal";
              }
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          gradientToColors: ["#F79839"],
          colorStops: [
            { offset: 0, color: "#E76000", opacity: 1 },
            { offset: 100, color: "#F79839", opacity: 1 }
          ]
        }
      },
      labels: ["Calorie Balance"]
    };
  }
}
