"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReportCardDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_report_card_dto_1 = require("./create-report-card.dto");
class UpdateReportCardDto extends (0, mapped_types_1.PartialType)(create_report_card_dto_1.CreateReportCardDto) {
}
exports.UpdateReportCardDto = UpdateReportCardDto;
//# sourceMappingURL=update-report-card.dto.js.map