import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ServiceProviderRequestApprobationComponent } from './service-provider-request-approbation.component';

describe('ServiceProviderRequestApprobationComponent', () => {
  let component: ServiceProviderRequestApprobationComponent;
  let fixture: ComponentFixture<ServiceProviderRequestApprobationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceProviderRequestApprobationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceProviderRequestApprobationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
