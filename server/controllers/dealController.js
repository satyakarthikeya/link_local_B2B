// filepath: c:\Users\pasar\Desktop\link-local\server\controllers\dealController.js
import { DealModel } from '../models/DealModel.js';
import { validationResult } from 'express-validator';

/**
 * Create a new deal for a product
 * POST /api/deals/product/:productId
 */
export async function createDeal(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.params;
    const dealData = req.body;

    const deal = await DealModel.createDeal(productId, dealData);
    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: deal
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create deal'
    });
  }
}

/**
 * Update deal for a product
 * PUT /api/deals/product/:dealId
 */
export async function updateDeal(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dealId } = req.params;
    const dealData = req.body;

    const updatedDeal = await DealModel.updateDeal(dealId, dealData);
    res.json({
      success: true,
      message: 'Deal updated successfully',
      data: updatedDeal
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update deal'
    });
  }
}

/**
 * Remove deal
 * DELETE /api/deals/:dealId
 */
export async function removeDeal(req, res) {
  try {
    const { dealId } = req.params;
    
    const result = await DealModel.removeDeal(dealId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Deal removed successfully'
    });
  } catch (error) {
    console.error('Error removing deal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove deal'
    });
  }
}

/**
 * Get deal information for a product
 * GET /api/deals/product/:productId
 */
export async function getDealByProductId(req, res) {
  try {
    const { productId } = req.params;
    
    const deal = await DealModel.getDealByProductId(productId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'No deal found for this product'
      });
    }
    
    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch deal'
    });
  }
}

/**
 * Get all active deals
 * GET /api/deals/active
 */
export async function getActiveDeals(req, res) {
  try {
    const filters = {
      businessman_id: req.query.businessman_id,
      exclude_businessman_id: req.query.exclude_businessman_id,
      category: req.query.category,
      deal_type: req.query.deal_type,
      is_featured: req.query.is_featured === 'true' ? true : 
                  req.query.is_featured === 'false' ? false : undefined,
      limit: parseInt(req.query.limit) || 10,
      page: parseInt(req.query.page) || 1,
      city: req.query.city
    };

    const deals = await DealModel.getActiveDeals(filters);
    res.json({
      success: true,
      data: deals
    });
  } catch (error) {
    console.error('Error fetching active deals:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active deals'
    });
  }
}

/**
 * Get deals by business ID
 * GET /api/deals/business/:businessId
 */
export async function getDealsByBusinessId(req, res) {
  try {
    const { businessId } = req.params;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }
    
    // Get deals associated with the business through products
    const deals = await DealModel.getDealsByBusinessId(businessId);
    
    return res.status(200).json({
      success: true,
      count: deals.length,
      deals: deals
    });
  } catch (error) {
    console.error('Error fetching business deals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch business deals',
      error: error.message
    });
  }
}

/**
 * Get featured deals
 * GET /api/deals/featured
 */
export async function getFeaturedDeals(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const deals = await DealModel.getFeaturedDeals(limit);
    res.json({
      success: true,
      data: deals
    });
  } catch (error) {
    console.error('Error fetching featured deals:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch featured deals'
    });
  }
}

/**
 * Check if a product has an active deal
 * GET /api/deals/product/:productId/check
 */
export async function checkProductDeal(req, res) {
  try {
    const { productId } = req.params;
    
    const hasActiveDeal = await DealModel.productHasActiveDeal(productId);
    
    res.json({
      success: true,
      hasActiveDeal
    });
  } catch (error) {
    console.error('Error checking product deal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check product deal'
    });
  }
}

/**
 * Get all deals (regardless of status)
 * GET /api/deals/all
 */
export async function getAllDeals(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort_by = 'created_at', 
      sort_order = 'desc',
      deal_type,
      exclude_businessman_id // Add this parameter
    } = req.query;
    
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort_by,
      sort_order,
      deal_type,
      exclude_businessman_id // Pass the exclusion parameter to the model
    };
    
    const result = await DealModel.getAllDeals(filters);
    
    return res.status(200).json({
      success: true,
      count: result.deals.length,
      total: result.total,
      pages: Math.ceil(result.total / parseInt(limit)),
      current_page: parseInt(page),
      deals: result.deals
    });
  } catch (error) {
    console.error('Error fetching all deals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch deals',
      error: error.message
    });
  }
}