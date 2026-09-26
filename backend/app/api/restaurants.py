from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import get_current_user_id
from app.schemas.restaurant import (
    MenuAnalysisResponse,
    MenuItemSchema,
    RestaurantMenuResponse,
    RestaurantSchema,
)
from app.services.analysis_service import analysis_service
from app.services.restaurant_service import restaurant_service

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

@router.get("/search", response_model=List[RestaurantSchema])
def search_restaurants(
    q: Optional[str] = Query("", description="Restaurant search query"),
    user_id: str = Depends(get_current_user_id)
):
    """Search seeded/demo restaurant database in Supabase."""
    results = restaurant_service.search_restaurants(query=q or "")
    return results

@router.get("/{id}/menu", response_model=RestaurantMenuResponse)
def get_restaurant_menu(
    id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Fetch restaurant details and menu items from Supabase."""
    restaurant = restaurant_service.get_restaurant(id)
    if not restaurant:
        restaurant = {
            "id": id,
            "name": "Demo Restaurant",
            "vegetarian_only": False,
            "confidence": 0.90
        }
    menu_items = restaurant_service.get_restaurant_menu(id)
    return RestaurantMenuResponse(
        restaurant=restaurant,
        items=menu_items
    )

@router.post("/{id}/analyze-menu", response_model=MenuAnalysisResponse)
def analyze_restaurant_menu(
    id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Analyze restaurant menu items automatically against user's profile
    using deterministic rules and hidden ingredient relationships.
    """
    profile = analysis_service.get_user_profile(user_id)
    analysis_result = restaurant_service.analyze_menu(id, profile)
    return analysis_result
