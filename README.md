# Babylon.js 1:1 现实比例园区展示系统

本项目是 `xzplays/babylon-ggec` 的程序化 Babylon.js 园区展示系统，目标是交付一个可离线构建、可浏览、可进入建筑的一比一现实比例厂区/园区场景。

## 比例规则

- 全局约定：`1 Babylon unit = 1 real-world meter`。
- 园区边界：`1200m × 900m`，位于 `src/data/campusLayout.ts` 的 `campusBounds`。
- 建筑、道路、门洞、楼层、停车位、围墙、人物高度和移动速度均按米制数据配置。
- HUD 和场景南侧提供 `100m` 可视化比例尺，俯瞰相机可覆盖完整园区。

## 场景内容

- 园区围墙、主入口大门、门卫室和中文门牌。
- 主干道、环路、支路、人行道、停车区、物流装卸区。
- 一期厂房区、二期生产区、仓储物流区、总部办公区、研发测试区、生活配套区。
- 超过 20 栋建筑：厂房、仓库、物流中心、办公楼、研发楼、宿舍、食堂生活配套。
- 每栋建筑均由地坪、外墙、屋顶、楼板、门洞、窗户阵列、入口雨棚、中文标识和类型化细节组成。
- 类型化细节示例：厂房有大跨度产线、行车梁、天窗；仓库有高位货架和月台；办公楼/研发楼有玻璃幕墙、前台和隔断；宿舍有阳台；食堂有餐桌和厨房服务区。
- 公共材质集中复用，树木、路灯、车位线、窗户等重复元素不再为每个对象创建独立材质。

## 操作方式

- `WASD` / 方向键：按当前视角方向移动。
- `Shift`：加速。
- `V`：在第一视角、第三视角、俯瞰视角之间切换。
- `E`：靠近建筑入口标记时进入一楼。
- `F`：在电梯附近切换到下一楼层。
- 右侧建筑面板：按区域分组，可“到门前”或“进入一楼”。
- HUD 显示当前视角、位置、坐标、移动速度 `m/s` 和比例说明。

## 模块结构

```text
src/main.ts                         # 启动入口，只负责创建 engine/scene 并装配模块
src/scene/createCampusScene.ts       # 园区场景、道路、围墙、绿化、比例尺等
src/data/campusLayout.ts             # 园区尺寸、道路、建筑、区域与真实米制数据
src/buildings/buildingTypes.ts        # 建筑类型、规格、楼层、门窗/功能定义
src/buildings/createBuilding.ts       # 数据驱动建筑生成器
src/camera/cameraController.ts        # 第一/第三/俯瞰视角相机控制
src/player/playerController.ts        # 人物移动、deltaTime 速度、进门、电梯交互
src/ui/hud.ts                         # HUD、分组建筑面板、比例与位置信息
src/materials/materials.ts            # 共享材质池
src/utils/label.ts                    # 中文动态标识牌
```

## 调整园区数据

主要编辑 `src/data/campusLayout.ts`：

- `campusBounds` 控制园区真实占地。
- `roads` 控制道路宽度与位置。
- `buildings` 中每栋建筑提供 `position`、`size`、`floors`、`floorHeight`、入口、电梯、楼梯、功能和特征。
- `validateBuildingSpec()` 会统一 `size.height = floors * floorHeight`，避免建筑高度与楼层高度不一致。

## 开发与构建

```bash
npm install
npm run dev
npm run build
```

构建产物位于 `dist/`，可交给静态文件服务器托管。

## 已知限制

- 当前为 Babylon.js 几何体程序化建模，不依赖外部 BIM、倾斜摄影或 GLTF 精细模型。
- 建筑内部为基础可漫游空间和功能暗示，不包含真实工艺设备 BIM 级精度。
- 后续如接入真实总图、BIM 或 GLTF，可继续复用现有数据层、HUD、相机和玩家控制模块。
