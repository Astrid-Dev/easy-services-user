import { Component, OnInit } from '@angular/core';
import {Service, ServiceStructure} from "../../models/Service";
import {TranslationService} from "../../services/translation.service";
import {Router} from "@angular/router";
import {CategoryService} from "../../services/category.service";
import {getARemoteResourcePath} from "../../helpers/helpers.functions";

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent implements OnInit {

  hasLoadedServices: boolean | null = null;

  servicesList: ServiceStructure[] = [];

  constructor(
    private translationService: TranslationService,
    private router: Router,
    private categoryService: CategoryService,
  ) { }

  ngOnInit() {
    this.loadServices();
  }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en;
  }

  categoryImageIllustration(illustration: string){
    return getARemoteResourcePath(illustration);
  }

  loadServices(){
    this.hasLoadedServices = null;
    this.categoryService.getAllServices()
      .then((res: any) =>{
        this.servicesList = [];
        res.filter((elt: Service) => elt.parent_id === null)
          .forEach((elt: Service) =>{
            this.servicesList.push({
              parent: elt,
              children: res.filter((child: Service) => child.parent_id === elt.id)
            });
          });
        this.hasLoadedServices = true;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedServices = false;
      });
  }

}
