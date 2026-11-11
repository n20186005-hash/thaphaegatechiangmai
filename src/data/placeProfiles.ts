import type { Locale } from './guides';
type T = Record<Locale,string>;
const t = (th:string,en:string,zh:string):T => ({th,en,zh});
export type PlaceProfile = { manager:T; architecture:T; walking:T; photography:T; facts:T; };
export const placeProfiles:Record<string,PlaceProfile> = {
 'wat-chedi-luang': {
  manager:t('วัดเจดีย์หลวงเป็นศาสนสถานพุทธที่ดำเนินกิจกรรมโดยคณะสงฆ์และผู้ดูแลวัด การอนุรักษ์องค์เจดีย์ประวัติศาสตร์เกี่ยวข้องกับหน่วยงานด้านโบราณสถานของไทย','Wat Chedi Luang is an active Buddhist temple administered through its monastic community and temple organization. Conservation of its historic chedi involves Thailand’s heritage authorities.','契迪龙寺是由寺院僧团及寺务体系管理的现役佛教场所；历史佛塔的文物保护涉及泰国文化遗产主管机构。'),
  architecture:t('เจดีย์ก่ออิฐขนาดมหึมามีฐานยกระดับและร่องรอยการเสียหาย ควรเปรียบเทียบขนาดองค์เจดีย์กับวิหารที่ใช้ประกอบพิธี','The enormous brick chedi rises over a stepped base and bears traces of structural change. Contrast its weathered masonry with the functioning worship halls.','巨大的砖砌佛塔立于层层台基之上，可观察历史损毁痕迹，并与仍在使用的佛殿比较。'),
  walking:t('จากประตูท่าแพเดินตามถนนราชดำเนินไปทางตะวันตกแล้วเลี้ยวเข้าพื้นที่วัด ตรวจจุดเข้าที่เปิดจริง','From the gate follow Ratchadamnoen west, then branch toward the temple precinct; use the open public entrance indicated on site.','从塔佩门沿拉差丹嫩路向西，再转入寺院街区，按照现场开放入口进入。'),
  photography:t('ถ่ายมุมกว้างของฐานเจดีย์จากพื้นที่ทางเดินที่อนุญาต ไม่รบกวนผู้ประกอบพิธี','Use a wide view from permitted paths to capture the chedi’s scale; avoid blocking rituals or photographing restricted areas.','从允许通行的路径拍摄佛塔整体尺度，不打扰礼佛活动，也不拍摄受限制区域。'),
  facts:t('จุดเด่นคือเจดีย์หลวงในเขตเมืองเก่า การเข้าวิหารและพื้นที่บูชาอยู่ภายใต้กติกาของวัด','The central attraction is the historic chedi inside Chiang Mai Old City; hall access and devotional areas follow temple rules.','核心看点为清迈古城中的历史大佛塔；佛殿和礼佛区遵循寺院规定。') },
 'wat-phra-singh': {
  manager:t('วัดพระสิงห์เป็นวัดพุทธที่มีคณะสงฆ์และฝ่ายบริหารวัดดูแลกิจกรรมและพื้นที่ศาสนสถาน','Wat Phra Singh is an active Buddhist monastery; its monastic and temple administration oversees religious spaces and activities.','帕辛寺属于持续开展宗教活动的佛教寺院，其僧团和寺务管理体系负责场所日常运行。'),
  architecture:t('ชมรูปทรงหลังคาซ้อนชั้น หน้าบันแกะสลัก และงานตกแต่งศิลปะล้านนาของวิหาร','Compare layered roofs, carved gables and intricate Lanna ornament across the viharn buildings.','观察佛殿层叠屋顶、雕刻山墙与精细的兰纳艺术装饰。'),
  walking:t('เดินไปทางตะวันตกตามถนนราชดำเนินจากประตูท่าแพ โดยเผื่อเวลาแวะวัดระหว่างทาง','Walk west along Ratchadamnoen from Tha Phae Gate, allowing time for other temples along the route.','从塔佩门沿拉差丹嫩路向西走，可按兴趣顺路停靠其他寺庙。'),
  photography:t('ใช้ทางเดินในลานวัดถ่ายหลังคาวิหารและเจดีย์ ตรวจข้อห้ามการถ่ายภาพภายใน','Photograph rooflines and the chedi from courtyard paths, checking interior photography signs first.','在寺院庭院通道拍摄屋顶与佛塔，进入殿内前先查看拍照限制。'),
  facts:t('วัดสำคัญทางฝั่งตะวันตกของเมืองเก่า มีอาคารศิลปะล้านนาและการประกอบศาสนพิธี','An important western Old City temple with Lanna architectural traditions and ongoing worship.','古城西部重要寺院，以兰纳建筑传统与仍在进行的宗教活动为特色。') },
 'wat-chiang-man': {
  manager:t('วัดเชียงมั่นเป็นวัดที่มีคณะสงฆ์ดูแลภายใต้ระบบการบริหารวัดของไทย','Wat Chiang Man remains under Buddhist monastic and temple administration.','清曼寺由佛教僧团及泰国寺院管理体系负责日常宗教事务。'),
  architecture:t('สังเกตเจดีย์ช้างล้อมที่ใช้รูปช้างรองรับฐานอาคาร พร้อมหลังคาและลานวัด','Study the elephant-supported chedi base and the contrasting geometry of temple halls and courtyards.','重点看象群承托的佛塔基座，以及佛殿屋顶与庭院布局。'),
  walking:t('เดินจากประตูท่าแพเข้าสู่เมืองเก่าแล้วขึ้นเหนือไปตามถนนสายรอง เลือกทางข้ามที่ปลอดภัย','Head into the Old City from the gate and turn north through smaller streets, checking crossings as you go.','从塔佩门进入古城后沿小街向北，行进时留意十字路口和过街安全。'),
  photography:t('เล็งมุมที่เห็นช้างรอบฐานเจดีย์โดยไม่เข้าเขตหวงห้าม','Compose a view of the elephants supporting the chedi without entering restricted sacred areas.','从允许的角度拍出佛塔基座周围的大象雕塑，不进入限制区域。'),
  facts:t('วัดสัมพันธ์กับประวัติการก่อตั้งเชียงใหม่และเป็นจุดแวะสำคัญทางเหนือของเมืองเก่า','Associated with the city’s early history, this is a rewarding northern Old City heritage stop.','与清迈早期建城历史有关，是古城北部重要文化停靠点。') },
 'three-kings-monument': {
  manager:t('ลานอนุสาวรีย์เป็นพื้นที่สาธารณะใจกลางเมืองที่เกี่ยวข้องกับการดูแลของเทศบาลนครเชียงใหม่ ส่วนอาคารพิพิธภัณฑ์ด้านหลังมีระบบบริหารแยกต่างหาก','The monument plaza is a civic public space associated with Chiang Mai Municipality. The museum building behind it has its own visitor operation.','三王纪念碑广场是清迈市中心公共空间，与清迈市政府的公共场所管理有关；其后方博物馆有独立访客管理。'),
  architecture:t('รูปหล่อสามกษัตริย์ตั้งอยู่หน้าอาคารราชการเก่าซึ่งกลายเป็นพื้นที่วัฒนธรรม สังเกตแกนสมมาตรของลาน','The three figures are set before a former government building now used for culture. Notice the plaza’s symmetry and civic composition.','三王铜像前方是转型为文化用途的旧行政建筑，可观察广场与立面的对称轴线。'),
  walking:t('เดินจากประตูท่าแพเข้าถนนราชดำเนิน แล้วเลี้ยวขึ้นเหนือสู่ลานอนุสาวรีย์','Go west along Ratchadamnoen from the gate and turn north toward the monument plaza.','从塔佩门沿拉差丹嫩路向西，再向北转入纪念碑广场。'),
  photography:t('ถ่ายรูปทั้งสามองค์พร้อมอาคารด้านหลังจากลานสาธารณะ โดยไม่ขวางผู้สักการะ','Frame all three figures with the heritage building behind, without interrupting offerings or other visitors.','从公共广场取景，将三位人物与后方历史建筑同时纳入画面，避免妨碍祭拜者。'),
  facts:t('อนุสาวรีย์ระลึกถึงพญามังราย พญางำเมือง และพ่อขุนรามคำแหง','The monument depicts Mangrai, Ngam Mueang and Ram Khamhaeng in Chiang Mai’s foundation narrative.','纪念碑人物为孟莱王、南蒙王和兰甘亨王，关联清迈建城历史叙事。') },
 'chiang-mai-city-arts-centre': {
  manager:t('ศูนย์ศิลปวัฒนธรรมเมืองเชียงใหม่เป็นส่วนหนึ่งของเครือข่ายศูนย์มรดกเมืองภายใต้เทศบาลนครเชียงใหม่','The Chiang Mai City Arts & Cultural Centre is part of the municipal City Heritage Centre network administered by Chiang Mai Municipality.','清迈城市艺术文化中心属于清迈市政府辖下的城市文化遗产中心体系。'),
  architecture:t('อาคารศาลากลางเก่าแสดงสถาปัตยกรรมราชการในเมืองเก่า ภายในใช้จัดนิทรรศการเมืองและวัฒนธรรมล้านนา','The former provincial hall is a notable civic building; its interior interprets the city’s history and Lanna culture.','旧省政厅建筑呈现历史行政建筑风貌，内部展示清迈城市发展及兰纳文化。'),
  walking:t('อยู่ติดกับลานอนุสาวรีย์สามกษัตริย์ เข้าตามจุดจำหน่ายบัตรและเวลาเปิดที่ประกาศ','It borders the Three Kings Monument plaza; enter by the museum’s operating entrance during published hours.','紧邻三王纪念碑广场，按博物馆公告的开放时段及入口参观。'),
  photography:t('ถ่ายรูปด้านนอกอาคารและหน้าต่างเก่า ส่วนภายในให้ปฏิบัติตามป้ายอนุญาต','Photograph the former government façade and windows outside; indoor photography depends on gallery rules.','可拍摄旧行政建筑外立面和窗户，馆内摄影应遵守展厅规定。'),
  facts:t('เป็นพิพิธภัณฑ์ประวัติศาสตร์เมือง ไม่ใช่ลานสาธารณะเปิดตลอดเวลา','A ticketed or scheduled museum experience rather than an always-open public square; confirm admission details.','这是按馆方时段运营的城市历史博物馆，并非全天开放的公共广场。') },
 'wat-lok-moli': {
  manager:t('วัดโลกโมฬีเป็นพื้นที่พุทธศาสนาที่ดูแลโดยคณะสงฆ์และการบริหารวัด','Wat Lok Moli is an active Buddhist site cared for through its monastic and temple organization.','罗摩利寺为佛教宗教场所，由僧团及寺务体系维护运行。'),
  architecture:t('เจดีย์อิฐและวิหารไม้เป็นคู่เปรียบเทียบงานก่อสร้างและลวดลายล้านนา','The old brick chedi and ornate wooden viharn make a strong contrast in materials and Lanna craftsmanship.','砖砌佛塔和装饰精致的木结构佛殿形成鲜明的兰纳工艺对照。'),
  walking:t('อยู่ด้านเหนือของแนวคูเมือง จากประตูท่าแพควรวางเส้นทางผ่านถนนด้านเหนือและจุดข้ามรถ','The temple is near the northern moat; plan a route via the Old City’s north side and use safe road crossings.','寺院靠近古城北侧护城河，建议沿古城北部安排路线并注意交通路口。'),
  photography:t('ถ่ายให้เห็นเจดีย์กับหลังคาวิหารร่วมกัน หลีกเลี่ยงผู้กำลังทำบุญ','Try a composition that includes both brick chedi and viharn roof while giving worshippers space.','尝试将砖塔与佛殿屋顶一起构图，并与礼佛者保持适当距离。'),
  facts:t('เป็นวัดใกล้คูเมืองเหนือที่มีลักษณะสถาปัตยกรรมต่างจากเจดีย์หลวง','A northern moat temple with a different architectural character from Wat Chedi Luang.','这座北侧寺庙与契迪龙寺的建筑风格和参观体验各有不同。') },
 'warorot-market': {
  manager:t('ตลาดวโรรสเป็นย่านตลาดพาณิชย์ที่ดำเนินกิจการโดยผู้ค้าร้านค้าและผู้บริหารตลาด ไม่ใช่พิพิธภัณฑ์ของเทศบาล','Warorot is a functioning commercial market run through market operators, individual shops and vendors, rather than a municipal museum.','瓦洛洛市场是由市场经营方、商家和摊贩共同构成的商业空间，不属于市政博物馆。'),
  architecture:t('อาคารตลาดหลายชั้นและตรอกสินค้ารอบนอกสะท้อนการค้าขายเมืองเชียงใหม่ยุคใหม่','Multi-level market buildings and surrounding trading lanes show how everyday commerce occupies the riverside district.','多层市场建筑和周边商贸小巷展现清迈现代商业街区的日常面貌。'),
  walking:t('จากประตูท่าแพมุ่งตะวันออกไปทางแม่น้ำปิงและย่านกาดหลวง ตรวจเส้นทางข้ามถนนหลัก','Head east from the gate toward the Ping River/Kad Luang district, choosing safe crossings of major streets.','从塔佩门向东朝平河和 Kad Luang 商圈前进，注意繁忙路段的过街点。'),
  photography:t('ถ่ายแนวแผงค้าและป้ายตลาดโดยหลีกเลี่ยงการถ่ายผู้ค้าระยะใกล้โดยไม่ขออนุญาต','Capture stall patterns and market signage; ask before close-up portraits of vendors or shoppers.','可拍摊位排列与市场招牌，对商户和顾客进行近距离人物拍摄前先征得同意。'),
  facts:t('มีทั้งอาหารแห้ง ของกินพื้นเมือง และสินค้าใช้ประจำวัน ตลาดมีการเคลื่อนไหวตลอดวัน','A working market for dried foods, regional snacks and daily goods, with activity varying by stall and time of day.','市场经营干货、地方小吃与日用品，各摊位时段并不完全相同。') },
 'chiang-mai-night-bazaar': {
  manager:t('ย่านเชียงใหม่ไนท์บาซาร์ประกอบด้วยพื้นที่ค้าขายของผู้ประกอบการและผู้ค้าแต่ละราย ไม่ใช่อาคารที่บริหารโดยหน่วยงานเดียว','Chiang Mai Night Bazaar is a commercial district with multiple venue operators and individual traders; there is no single manager for every stall.','清迈夜市是一片由不同场地方与独立商户经营的商业街区，不能将全部摊位归为同一管理单位。'),
  architecture:t('จุดเด่นไม่ใช่อาคารโบราณ แต่เป็นแนวตลาด แสงไฟ ป้ายร้าน และโครงสร้างแผงค้าชั่วคราว','The attraction is the streetscape of stalls, signs, lighting and shopping arcades rather than a single historic monument.','主要看点是摊位、店招、灯光和购物廊道构成的夜市街景，并非单一古迹建筑。'),
  walking:t('จากประตูท่าแพไปทางตะวันออกตามถนนท่าแพ แล้วลงสู่ย่านช้างคลานและไนท์บาซาร์','Walk east along Tha Phae Road from the gate, then follow signs toward the Chang Khlan/Night Bazaar area.','从塔佩门沿塔佩路向东，再往昌康路夜市商圈方向步行。'),
  photography:t('ถ่ายไฟและป้ายร้านยามค่ำจากพื้นที่คนเดิน ระวังไม่ขวางหน้าร้านหรือถ่ายผู้ซื้อโดยไม่ยินยอม','Shoot lit signs and stalls from pedestrian space without blocking shops or photographing patrons without consent.','从步行空间拍摄夜间灯牌和摊位，不挡店门，对顾客拍摄先征得许可。'),
  facts:t('ควรตรวจเวลาขายของของแต่ละโซนและเตรียมวิธีเดินทางกลับเมื่อดึก','Operating times differ by zone and vendor; plan the return journey before a late visit.','不同摊区和商户营业时间不一，夜间游览应预先安排返程。') },
 'wat-buppharam': {
  manager:t('วัดบุพพารามเป็นวัดพุทธที่บริหารโดยคณะสงฆ์และผู้ดูแลวัด','Wat Buppharam is an active Buddhist temple operated by its monastic and temple administration.','布帕兰寺是由僧团和寺务管理方运营的佛教寺院。'),
  architecture:t('วิหารและอาคารศาสนสถานมีรูปแบบประดับตกแต่งหลายยุค เหมาะกับการพิจารณาหลังคาและงานแกะสลัก','Its decorated halls show varied architectural details; compare roofs, carved ornament and religious imagery.','佛殿及附属宗教建筑具有多样装饰，可比较屋顶、雕刻与宗教图像。'),
  walking:t('เดินจากประตูท่าแพไปตะวันออกตามถนนท่าแพ วัดตั้งอยู่ก่อนถึงย่านตลาดกลางคืน','Walk east along Tha Phae Road from the gate; the temple sits on the way toward the night-market district.','从塔佩门沿塔佩路向东，寺院位于前往夜市商圈的途中。'),
  photography:t('เลือกมุมจากลานวัดเห็นอาคารเต็มหลัง ไม่ถ่ายบุคคลที่กำลังสวดมนต์ใกล้เกินไป','Use courtyard views for full building compositions, keeping respectful distance from prayers.','在庭院选择能够呈现完整建筑的机位，对诵经礼佛者保持距离。'),
  facts:t('จุดแวะทางวัฒนธรรมบนถนนท่าแพ ไม่ใช่พื้นที่จัดตลาด','A cultural temple stop along Tha Phae Road, distinct from the commercial market nearby.','位于塔佩路上的宗教文化停靠点，与附近商业市场性质不同。') },
 'ping-river-walk': {
  manager:t('แนวทางเดินริมแม่น้ำและถนนเชื่อมเกี่ยวข้องกับการดูแลพื้นที่สาธารณะของหน่วยงานท้องถิ่น โดยแต่ละสะพานหรือเอกชนริมน้ำอาจอยู่ต่างผู้ดูแล','Riverside public routes and roads involve local public-space authorities, while individual bridges and private riverfront properties may have different operators.','平河沿岸公共步道和道路由相关地方公共空间部门维护，但具体桥梁与私人河岸设施可能分别管理。'),
  architecture:t('สังเกตสะพาน อาคารร้านค้าเก่าและใหม่ และการเปลี่ยนสภาพจากกำแพงเมืองไปสู่ย่านริมแม่น้ำ','Notice bridge structures, old and newer commercial façades, and the shift from walled-city streets toward the river.','观察桥梁结构、新旧商铺立面，以及从古城街道过渡到河岸商业区的城市景观。'),
  walking:t('จากประตูท่าแพเดินตะวันออกไปตามถนนท่าแพจนถึงย่านแม่น้ำ เลือกสะพานและทางม้าลายที่ปลอดภัย','Follow Tha Phae Road east from the gate toward the river district, choosing safe bridge approaches and crossings.','由塔佩门沿塔佩路向东前往河岸区域，选择安全的桥梁入口和过街位置。'),
  photography:t('ใช้ทางเดินสาธารณะถ่ายภาพแนวแม่น้ำและสะพาน ไม่ยืนบนผิวจราจรเพื่อจัดภาพ','Photograph the river and bridges from public pedestrian paths, never from live traffic lanes.','从公共人行道拍摄河景与桥梁，不为取景站到车行道上。'),
  facts:t('เส้นทางชมเมือง ไม่มีเวลาปิดแบบพิพิธภัณฑ์ แต่ต้องคำนึงถึงสภาพอากาศและการจราจร','An urban walking route rather than a museum admission site; weather and traffic determine its practicality.','这是城市步行路线而非单一售票景点，是否适合行走主要取决于天气和交通。') },
};
