# Supabase Optimization Rollback Instructions

## Quick Rollback (if issues occur):

```bash
# Restore original files
rm -rf src/services src/contexts
mv src/services_backup src/services
mv src/contexts_backup src/contexts

# Restart the dev server
npm start
```

## Files Being Modified:
- src/services/supabaseService.ts
- src/contexts/*ContextSupabase.tsx files

## Original Backup Location:
- src/services_backup/
- src/contexts_backup/

## Changes Being Made:
1. Phase 1: Replace SELECT * with targeted field selection
2. Phase 2: Implement shared data loading (if successful)
3. Phase 3: Add pagination (if needed)
4. Phase 4: Client-side caching (if all previous phases work)

## Testing Checklist After Each Phase:
- [ ] Admin dashboard loads without errors
- [ ] Driver dashboard loads without errors  
- [ ] Bin management CRUD operations work
- [ ] Driver management CRUD operations work
- [ ] Pickup requests management works
- [ ] Route generation functions properly

Created on: $(date)