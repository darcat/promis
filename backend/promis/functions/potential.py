def ef_quick_look(doc, npoints = 100):
    """
    [en]: POTENTIAL's electrical field quicklook
    [uk]: Предперегляд електричного поля з ПОТЕНЦІАЛу
    """
    return { "mv": stats.general_quick_look(doc["mv"], npoints) }


def ef_export(doc, session, fmt):
    """
    [en]: POTENTIAL's electrical field export
    [uk]: Експорт електричного поля з ПОТЕНЦІАЛу
    """
    if fmt=="ascii":
        # TODO: take value name and units from parameter?
        # TODO: take parameter from somewhere?
        tbl = export.make_table(doc["mv"], session.time_begin, session.time_end, session.geo_line)
        return export.ascii_export(tbl, "Electric Field", "(mV)")

