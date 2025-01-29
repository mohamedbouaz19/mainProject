import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardinalityDialogComponent } from './cardinality-dialog.component';

describe('CardinalityDialogComponent', () => {
  let component: CardinalityDialogComponent;
  let fixture: ComponentFixture<CardinalityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardinalityDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardinalityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
