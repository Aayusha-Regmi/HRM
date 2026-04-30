// Only export color utility for department charts
const departmentPalette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
export const getDepartmentColor = (index) => departmentPalette[index % departmentPalette.length];
