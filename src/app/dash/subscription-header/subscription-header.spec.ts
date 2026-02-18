import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionHeader } from './subscription-header';

describe('SubscriptionHeader', () => {
  let component: SubscriptionHeader;
  let fixture: ComponentFixture<SubscriptionHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
